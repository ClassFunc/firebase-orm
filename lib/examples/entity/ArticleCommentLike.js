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
exports.ArticleCommentLike = void 0;
const Entity_1 = require("../../Entity");
const Article_1 = require("./Article");
const ArticleComment_1 = require("./ArticleComment");
let ArticleCommentLike = class ArticleCommentLike {
};
__decorate([
    (0, Entity_1.PrimaryColumn)(),
    __metadata("design:type", String)
], ArticleCommentLike.prototype, "id", void 0);
__decorate([
    (0, Entity_1.Column)(),
    __metadata("design:type", Number)
], ArticleCommentLike.prototype, "count", void 0);
ArticleCommentLike = __decorate([
    (0, Entity_1.NestedFirebaseEntity)('article_comment_likes', () => Article_1.Article, () => ArticleComment_1.ArticleComment)
], ArticleCommentLike);
exports.ArticleCommentLike = ArticleCommentLike;
//# sourceMappingURL=ArticleCommentLike.js.map