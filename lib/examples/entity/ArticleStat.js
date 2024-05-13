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
exports.ArticleStat = void 0;
const Entity_1 = require("../../Entity");
const Article_1 = require("./Article");
let ArticleStat = class ArticleStat {
};
exports.ArticleStat = ArticleStat;
__decorate([
    (0, Entity_1.PrimaryColumn)(),
    __metadata("design:type", String)
], ArticleStat.prototype, "id", void 0);
__decorate([
    (0, Entity_1.OneToOne)(() => Article_1.Article, { joinColumnName: 'article_id' }),
    __metadata("design:type", Article_1.Article)
], ArticleStat.prototype, "article", void 0);
__decorate([
    (0, Entity_1.Column)({ name: 'num_of_views' }),
    __metadata("design:type", Number)
], ArticleStat.prototype, "numOfViews", void 0);
exports.ArticleStat = ArticleStat = __decorate([
    (0, Entity_1.FirebaseEntity)('article_stats')
], ArticleStat);
//# sourceMappingURL=ArticleStat.js.map