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
const admin = require("firebase-admin");
const Repository_1 = require("../Repository");
const User_1 = require("./entity/User");
const ArticleStat_1 = require("./entity/ArticleStat");
const Article_1 = require("./entity/Article");
const Category_1 = require("./entity/Category");
const Serializer_1 = require("../Serializer");
const ArticleComment_1 = require("./entity/ArticleComment");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const serviceAccount = require("../../polyrhythm-dev-example-firebase-adminsdk-ed17d-272223a77d.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    const db = admin.firestore();
    (0, Repository_1.addDBToPool)('default', db);
    (0, Repository_1.use)('default');
    const [article, comment] = yield (0, Repository_1.runTransaction)((manager) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield manager.getRepository(Article_1.Article).save(article);
        const articleStat = new ArticleStat_1.ArticleStat();
        articleStat.article = article;
        articleStat.numOfViews = 100;
        yield manager.getRepository(ArticleStat_1.ArticleStat).save(articleStat);
        const articleComment = new ArticleComment_1.ArticleComment();
        articleComment.text = 'hello';
        yield manager.getRepository(ArticleComment_1.ArticleComment, { parentIdMapper: (_) => {
                return article.id;
            } }).save(articleComment);
        return [article, articleComment];
    }));
    const json = Serializer_1.FirebaseEntitySerializer.serializeToJSON(article);
    const instance = Serializer_1.FirebaseEntityDeserializer.deserializeFromJSON(Article_1.Article, json);
    console.log(instance);
}))();
//# sourceMappingURL=main.js.map