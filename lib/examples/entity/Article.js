"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Article = void 0;
const Entity_1 = require("../../Entity");
const ArticleStat_1 = require("./ArticleStat");
const Category_1 = require("./Category");
const User_1 = require("./User");
const firebase_admin_1 = require("firebase-admin");
let Article = class Article {
    beforeSave() {
        console.log('before save');
    }
    afterSave() {
        console.log('after save');
    }
    afterLoad() {
        console.log('after load');
    }
};
exports.Article = Article;
__decorate([
    (0, Entity_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Article.prototype, "id", void 0);
__decorate([
    (0, Entity_1.BeforeSave)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Article.prototype, "beforeSave", null);
__decorate([
    (0, Entity_1.AfterSave)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Article.prototype, "afterSave", null);
__decorate([
    (0, Entity_1.AfterLoad)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Article.prototype, "afterLoad", null);
__decorate([
    (0, Entity_1.Column)(),
    __metadata("design:type", String)
], Article.prototype, "title", void 0);
__decorate([
    (0, Entity_1.ManyToOne)(() => User_1.User, { joinColumnName: 'user_id' }),
    __metadata("design:type", User_1.User)
], Article.prototype, "user", void 0);
__decorate([
    (0, Entity_1.OneToOne)(() => ArticleStat_1.ArticleStat, { relationColumn: 'article_id' }),
    __metadata("design:type", ArticleStat_1.ArticleStat)
], Article.prototype, "stat", void 0);
__decorate([
    (0, Entity_1.ArrayReference)(() => Category_1.Category, { joinColumnName: 'categories' }),
    __metadata("design:type", Array)
], Article.prototype, "categories", void 0);
__decorate([
    (0, Entity_1.Column)({ name: "content_text" }),
    __metadata("design:type", String)
], Article.prototype, "contentText", void 0);
__decorate([
    (0, Entity_1.Column)({ name: "posted_at" }),
    __metadata("design:type", firebase_admin_1.firestore.Timestamp)
], Article.prototype, "postedAt", void 0);
exports.Article = Article = __decorate([
    (0, Entity_1.FirebaseEntity)('articles')
], Article);
//# sourceMappingURL=Article.js.map