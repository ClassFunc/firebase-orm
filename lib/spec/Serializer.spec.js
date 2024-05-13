"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const admin = require("firebase-admin");
const Repository_1 = require("../Repository");
const User_1 = require("../examples/entity/User");
const ArticleStat_1 = require("../examples/entity/ArticleStat");
const Article_1 = require("../examples/entity/Article");
const Category_1 = require("../examples/entity/Category");
const chai_1 = require("chai");
const ArticleComment_1 = require("../examples/entity/ArticleComment");
const Serializer_1 = require("../Serializer");
const EntityBuilder_1 = require("../EntityBuilder");
const Entity_1 = require("../Entity");
const child_process_1 = require("child_process");
const ArticleCommentLike_1 = require("../examples/entity/ArticleCommentLike");
const serviceAccount = require("../../polyrhythm-dev-example-firebase-adminsdk-ed17d-272223a77d.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});
const db = admin.firestore();
function getInitialData() {
    return (0, Repository_1.runTransaction)((manager) => __awaiter(this, void 0, void 0, function* () {
        const user = new User_1.User();
        user.name = 'test-user';
        yield manager.getRepository(User_1.User).save(user);
        const category = new Category_1.Category();
        category.name = 'math';
        yield manager.getRepository(Category_1.Category).save(category);
        const article = new Article_1.Article();
        article.title = 'title';
        article.contentText = 'bodybody';
        article.user = user;
        article.categories = [category];
        article.postedAt = admin.firestore.Timestamp.now();
        yield manager.getRepository(Article_1.Article).save(article);
        const articleStat = new ArticleStat_1.ArticleStat();
        articleStat.article = article;
        articleStat.numOfViews = 100;
        yield manager.getRepository(ArticleStat_1.ArticleStat).save(articleStat);
        const articleComment = new ArticleComment_1.ArticleComment();
        articleComment.text = 'hello';
        yield manager.getRepository(ArticleComment_1.ArticleComment, { parentIdMapper: (Entity) => {
                switch (Entity) {
                    case Article_1.Article:
                        return article.id;
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);
            } }).save(articleComment);
        const like = new ArticleCommentLike_1.ArticleCommentLike();
        like.count = 100;
        yield manager.getRepository(ArticleCommentLike_1.ArticleCommentLike, { parentIdMapper: (Entity) => {
                switch (Entity) {
                    case Article_1.Article:
                        return article.id;
                    case ArticleComment_1.ArticleComment:
                        return articleComment.id;
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);
            } }).save(like);
        return [article, articleStat, articleComment, like];
    }));
}
(0, Repository_1.addDBToPool)('default', db);
(0, Repository_1.use)('default');
function deleteAllData(Entity) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, child_process_1.execSync)(`firebase firestore:delete ${(0, Entity_1.findMeta)(Entity).tableName} -r --project polyrhythm-dev-example -y`);
    });
}
function cleanTables() {
    return __awaiter(this, void 0, void 0, function* () {
        yield deleteAllData(User_1.User);
        yield deleteAllData(Article_1.Article);
        yield deleteAllData(ArticleStat_1.ArticleStat);
        yield deleteAllData(Category_1.Category);
    });
}
describe('FirebaseEntitySerializer and FirebaseEntityDeserializer test', () => __awaiter(void 0, void 0, void 0, function* () {
    before(() => __awaiter(void 0, void 0, void 0, function* () {
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield cleanTables();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    }));
    after(() => __awaiter(void 0, void 0, void 0, function* () {
    }));
    context('FirebaseEntitySerializer', () => {
        it("should serialize article", () => __awaiter(void 0, void 0, void 0, function* () {
            const [article, articleStat, articleComment, like] = yield getInitialData();
            const articleJson = Serializer_1.FirebaseEntitySerializer.serializeToJSON(article);
            (0, chai_1.expect)(articleJson).haveOwnProperty(Serializer_1.referenceCluePath);
            (0, chai_1.expect)(articleJson.user).haveOwnProperty(Serializer_1.referenceCluePath);
            (0, chai_1.expect)(articleJson.categories[0]).haveOwnProperty(Serializer_1.referenceCluePath);
            const articleStatJson = Serializer_1.FirebaseEntitySerializer.serializeToJSON(articleStat);
            (0, chai_1.expect)(articleStatJson).haveOwnProperty(Serializer_1.referenceCluePath);
            const commnetJSON = Serializer_1.FirebaseEntitySerializer.serializeToJSON(articleComment, (Entity) => {
                switch (Entity) {
                    case Article_1.Article:
                        return article.id;
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);
            });
            (0, chai_1.expect)(commnetJSON).haveOwnProperty(Serializer_1.referenceCluePath).to.haveOwnProperty('parent');
            const likeJSON = Serializer_1.FirebaseEntitySerializer.serializeToJSON(like, (Entity) => {
                switch (Entity) {
                    case Article_1.Article:
                        return article.id;
                    case ArticleComment_1.ArticleComment:
                        return articleComment.id;
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);
            });
            (0, chai_1.expect)(likeJSON).haveOwnProperty(Serializer_1.referenceCluePath).to.haveOwnProperty('parent').to.haveOwnProperty('child');
        }));
        it("should failed to serialize articleComment without parentId", () => __awaiter(void 0, void 0, void 0, function* () {
            const [_1, _2, articleComment] = yield getInitialData();
            try {
                Serializer_1.FirebaseEntitySerializer.serializeToJSON(articleComment);
                throw new Error('never reached here');
            }
            catch (_a) { }
        }));
    });
    context('FirebaseEntityDeserializer', () => {
        it("should deserialize article", () => __awaiter(void 0, void 0, void 0, function* () {
            const [_article, _articleStat, _articleComment, _like] = yield getInitialData();
            const articleJson = Serializer_1.FirebaseEntitySerializer.serializeToJSON(_article);
            const commnetJSON = Serializer_1.FirebaseEntitySerializer.serializeToJSON(_articleComment, (Entity) => {
                switch (Entity) {
                    case Article_1.Article:
                        return _article.id;
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);
            });
            const likeJSON = Serializer_1.FirebaseEntitySerializer.serializeToJSON(_like, (Entity) => {
                switch (Entity) {
                    case Article_1.Article:
                        return _article.id;
                    case ArticleComment_1.ArticleComment:
                        return _articleComment.id;
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);
            });
            const article = Serializer_1.FirebaseEntityDeserializer.deserializeFromJSON(Article_1.Article, articleJson);
            (0, chai_1.expect)(article).haveOwnProperty(EntityBuilder_1.documentReferencePath);
            (0, chai_1.expect)(article.user).haveOwnProperty(EntityBuilder_1.documentReferencePath);
            (0, chai_1.expect)(article.categories[0]).haveOwnProperty(EntityBuilder_1.documentReferencePath);
            const stat = Serializer_1.FirebaseEntityDeserializer.deserializeFromJSON(ArticleStat_1.ArticleStat, _articleStat);
            (0, chai_1.expect)(stat).haveOwnProperty(EntityBuilder_1.documentReferencePath);
            const comment = Serializer_1.FirebaseEntityDeserializer.deserializeFromJSON(ArticleComment_1.ArticleComment, commnetJSON, (Entity) => {
                switch (Entity) {
                    case Article_1.Article:
                        return article.id;
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);
            });
            (0, chai_1.expect)(comment).haveOwnProperty(EntityBuilder_1.documentReferencePath);
            const like = Serializer_1.FirebaseEntityDeserializer.deserializeFromJSON(ArticleCommentLike_1.ArticleCommentLike, likeJSON, (Entity) => {
                switch (Entity) {
                    case Article_1.Article:
                        return _article.id;
                    case ArticleComment_1.ArticleComment:
                        return _articleComment.id;
                }
                throw new Error(`Unknonwn Entity ${Entity.name}`);
            });
            (0, chai_1.expect)(like).haveOwnProperty(EntityBuilder_1.documentReferencePath);
        }));
        it("should failed to deserialize articleComment without parentId", () => __awaiter(void 0, void 0, void 0, function* () {
            const [_1, _2, articleComment] = yield getInitialData();
            try {
                Serializer_1.FirebaseEntityDeserializer.deserializeFromJSON(ArticleComment_1.ArticleComment, articleComment);
                throw new Error('never reached here');
            }
            catch (_a) { }
        }));
        it("should deserialize article from json string", () => __awaiter(void 0, void 0, void 0, function* () {
            const [_article, _1, _2, _3] = yield getInitialData();
            const serialized = Serializer_1.FirebaseEntitySerializer.serializeToJSONString(_article);
            (0, chai_1.expect)(typeof serialized == "string").to.be.true;
            const article = Serializer_1.FirebaseEntityDeserializer.deserializeFromJSONString(Article_1.Article, serialized);
            (0, chai_1.expect)(article.id).eq(_article.id);
        }));
        it("should serialize/deserialize article with timestamp type converts", () => __awaiter(void 0, void 0, void 0, function* () {
            const [article, _1, _2, _3] = yield getInitialData();
            const serialized = Serializer_1.FirebaseEntitySerializer.serializeToJSON(article, undefined, {
                timeStampToString: true
            });
            (0, chai_1.expect)(typeof serialized.postedAt).eq('string');
            const deserialized = Serializer_1.FirebaseEntityDeserializer.deserializeFromJSON(Article_1.Article, serialized, undefined, {
                stringToTimeStamp: true
            });
            (0, chai_1.expect)(deserialized.postedAt.seconds).eq(article.postedAt.seconds);
        }));
    });
}));
//# sourceMappingURL=Serializer.spec.js.map