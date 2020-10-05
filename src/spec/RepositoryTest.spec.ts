import 'mocha';
import * as admin from 'firebase-admin';
import { addDBToPool, getRepository, runTransaction, use } from "../Repository";
import { User } from '../examples/entity/User';
import { ArticleStat } from '../examples/entity/ArticleStat';
import { Article } from '../examples/entity/Article';
import { Category } from '../examples/entity/Category';
import { expect } from 'chai';
import { EventEmitter } from 'events';
import { ArticleComment } from '../examples/entity/ArticleComment';

const serviceAccount = require("../../polyrhythm-dev-example-firebase-adminsdk-ed17d-e1dd189e07.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://polyrhythm-dev-example.firebaseio.com"
});

const db = admin.firestore();

function getRandomIntString(max: number = 1000) {
    return Math.floor(Math.random() * Math.floor(max)).toString();
  }

addDBToPool('default', db);
use('default');

async function deleteAllData<T extends {id: string}>(Entity: new () => T) {
    const resources = await getRepository(Entity).fetchAll();
    for(const r of resources) {
        await getRepository(Entity).delete(r);
    }    
}

async function cleanTables() {
    await deleteAllData(User);
    await deleteAllData(Article);
    await deleteAllData(ArticleStat);
    await deleteAllData(Category);
}

describe('Repository test', async () => {
    before(async () => {
        
    });

    beforeEach(async () => {
        await cleanTables();
    });

    afterEach(async () => {
        
    });

    after(async () => {
        
    });

    context('simple CRUD', () => {
        it("should perform simple CRUD", async () => {
            const repo = getRepository(User);

            // create
            const user = new User();
            user.id = getRandomIntString();
            user.name = 'test-user';
            await repo.save(user);

            // fetch
            expect((await repo.fetchOneById(user.id))?.id).eq(user.id);

            // update
            user.name = 'updated';
            await repo.save(user);

            expect((await repo.fetchOneById(user.id))?.name).eq('updated');

            // delete
            await repo.delete(user);
            expect((await repo.fetchOneById(user.id))).to.be.null;
        });
    });

    context('relations', () => {
        it("Many to One", async () => {
            const article = await runTransaction(async manager => {
                const user = new User();
                user.id = getRandomIntString();
                user.name = 'test-user';
                await manager.getRepository(User).save(user);

                const article = new Article();
                article.id = getRandomIntString();
                article.title = 'title';
                article.contentText = 'bodybody';
                article.user = user;

                await manager.getRepository(Article).save(article);

                return article;
            });            

            const item = await getRepository(Article).fetchOneById(article.id, {
                relations: ['user']
            });

            expect(item?.id).eq(article.id);
            expect(article?.user.id).eq(article.user.id);
        });

        it("One to One", async () => {
            const article = await runTransaction(async manager => {
                const stat = new ArticleStat();
                stat.id = getRandomIntString();
                stat.numOfViews = 10000;
                await manager.getRepository(ArticleStat).save(stat);

                const article = new Article();
                article.id = getRandomIntString();
                article.title = 'title';
                article.contentText = 'bodybody';
                article.stat = stat;

                await manager.getRepository(Article).save(article);

                return article;
            });            

            const item = await getRepository(Article).fetchOneById(article.id, {
                relations: ['stat']
            });

            expect(item?.id).eq(article.id);
            expect(article?.stat.id).eq(article.stat.id);
        });   
        
        it("One to Many", async () => {
            const article = await runTransaction(async manager => {
                const user = new User();
                user.id = getRandomIntString();
                user.name = 'test-user';
                await manager.getRepository(User).save(user);

                const article = new Article();
                article.id = getRandomIntString();
                article.title = 'title';
                article.contentText = 'bodybody';
                article.user = user;

                await manager.getRepository(Article).save(article);

                return article;
            });            

            const user = await getRepository(User).fetchOneById(article.user.id, {
                relations: ['articles']
            });

            expect(user?.id).eq(article.user.id);
            expect(user?.articles[0].id).eq(article.id);
        });                  

        it("should fetch nested relation data", async () => {
            const userId = await runTransaction(async manager => {
                const user = new User();
                user.id = getRandomIntString();
                user.name = 'test-user';
                await manager.getRepository(User).save(user);

                const category = new Category();
                category.id = getRandomIntString();
                category.name = 'math';
                await manager.getRepository(Category).save(category);

                const article = new Article();
                article.id = getRandomIntString();
                article.title = 'title';
                article.contentText = 'bodybody';
                article.user = user;
                article.category = category;

                await manager.getRepository(Article).save(article);

                const articleStat = new ArticleStat();
                articleStat.id = getRandomIntString();
                articleStat.article = article;
                articleStat.numOfViews = 100;

                await manager.getRepository(ArticleStat).save(articleStat);

                return user.id;
            });

            const user = await getRepository(User).fetchOneById(userId, {
                relations: ['articles.category', 'articles.stat']
            });

            expect(user?.articles.length).eq(1);
            expect(user?.articles[0]).haveOwnProperty('stat');
            expect(user?.articles[0]).haveOwnProperty('category');
        });
    });

    context('transactions', () => {
        it("should rollback creation", async () => {
            try {
                await runTransaction(async manager => {
                    const user = new User();
                    user.id = getRandomIntString();
                    user.name = 'test-user';
                    await manager.getRepository(User).save(user);

                    const article = new Article();
                    article.id = getRandomIntString();
                    article.title = 'title';
                    article.contentText = 'bodybody';
                    article.user = user;

                    await manager.getRepository(Article).save(article);

                    throw new Error('rollback');
                });            
            } catch(e) {
                const users = await getRepository(User).fetchAll();
                const articles = await getRepository(Article).fetchAll();
                expect(users.length).eq(0);
                expect(articles.length).eq(0);
            }
        });

        it("should rollback deletion", async () => {
            const userId = getRandomIntString();
            const user = new User();
            user.id = userId;
            user.name = 'test-user';
            await getRepository(User).save(user);            
            try {
                await runTransaction(async manager => {
                    const user = await manager.getRepository(User).fetchOneById(userId);
                    await manager.getRepository(User).delete(user!);
                    throw new Error('rollback');
                });            
            } catch(e) {
                const user = await getRepository(User).fetchOneById(userId);
                expect(user?.id).eq(userId);
            }
        });        
    });

    context('nestedCollection', () => {
        it("should perform curd for nested collection", async () => {
            const result = await runTransaction(async manager => {
                const user = new User();
                user.id = getRandomIntString();
                user.name = 'test-user';
                await manager.getRepository(User).save(user);

                const article = new Article();
                article.id = getRandomIntString();
                article.title = 'title';
                article.contentText = 'bodybody';
                article.user = user;

                await manager.getRepository(Article).save(article);

                const articleComment = new ArticleComment();
                articleComment.id = getRandomIntString();
                articleComment.text = 'hello';           
                
                await manager.getRepository(ArticleComment, {withParentId: article.id}).save(articleComment);

                return [article, articleComment];
            });

            const article = result[0] as Article;

            const commentRepo = getRepository(ArticleComment, {withParentId: article.id});

            let comments = await commentRepo.fetchAll();
            expect(comments.length).eq(1);

            let comment = comments[0];
            comment.text = 'updated';
            await commentRepo.save(comment);

            comments = await commentRepo.fetchAll();
            comment = comments[0];
            expect(comment.text).eq("updated");

            await commentRepo.delete(comment);
            comments = await commentRepo.fetchAll();
            expect(comments.length).eq(0);
        })
    });    

    context('onSnapshot', () => {
        it("should sync snap shot with relations", async () => {
            const evm = new EventEmitter();
            let phase = 1;

            const unsubscribe = getRepository(User).prepareFetcher(db => {
                return db.limit(5);
            }).onSnapShot(async result => {
                const type = result.type;
                switch(phase) {
                case 1:
                    expect(type).eq('added');
                    const user = result.item;
                    expect(user?.articles.length).eq(1);
                    expect(user?.articles[0]).haveOwnProperty('stat');
                    expect(user?.articles[0]).haveOwnProperty('category');                    
                    phase++;
                    evm.emit(phase.toString(), result.item);
                    break;

                case 2:
                    expect(type).eq('modified');
                    phase++;
                    evm.emit(phase.toString(), result.item);                    
                    break;

                case 3:
                    expect(type).eq('removed');
                    unsubscribe();
                    break;
                }
            }, {
                relations: ['articles.category', 'articles.stat']
            });

            // phase 1
            await runTransaction(async manager => {
                const user = new User();
                user.id = getRandomIntString();
                user.name = 'test-user';
                await manager.getRepository(User).save(user);

                const category = new Category();
                category.id = getRandomIntString();
                category.name = 'math';
                await manager.getRepository(Category).save(category);

                const article = new Article();
                article.id = getRandomIntString();
                article.title = 'title';
                article.contentText = 'bodybody';
                article.user = user;
                article.category = category;

                await manager.getRepository(Article).save(article);

                const articleStat = new ArticleStat();
                articleStat.id = getRandomIntString();
                articleStat.article = article;
                articleStat.numOfViews = 100;

                await manager.getRepository(ArticleStat).save(articleStat);
            });

            evm.on('2', async (user: User) => {
                user.name = 'updated';
                await getRepository(User).save(user);
            });

            evm.on('3', async (user: User) => {
                await getRepository(User).delete(user);
            });            
        });
    });
});