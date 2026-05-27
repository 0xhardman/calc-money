-- Annotate transactions based on itinerary
-- Companion: 小曹 (Cao Jingyu). Trip dates 5/13-5/23 with 小曹 joining 5/14 onwards.
-- Default: 2-person split for shared expenses (food, transport, lodging, joint tickets)
-- Personal items (pre-trip tickets bought by Hardman alone for both? need confirm — defaulting to shared since joint visits)

-- ===== Pre-trip tickets (bought by Hardman for both) =====
UPDATE transactions SET category='景点门票', note='梵蒂冈博物馆门票 (5/22 行程)', is_shared=TRUE, share_count=2 WHERE merchant='biglietteriamusei.vatican';
UPDATE transactions SET category='景点门票', note='乌菲兹美术馆门票 (5/16 佛罗伦萨)', is_shared=TRUE, share_count=2 WHERE merchant='WWW.B-TICKET.COM.UFFIZI';
UPDATE transactions SET category='景点门票', note='斗兽场/古罗马遗迹门票 (5/21 罗马) - coopculture', is_shared=TRUE, share_count=2 WHERE merchant='WWW.COOPCULTURE.IT';

-- ===== 5/12-13 转机 & 抵达卢卡 =====
UPDATE transactions SET category='交通', note='伊斯坦布尔机场 HAVAIST 大巴 (转机时短暂入境/购物)', is_shared=FALSE WHERE merchant='HAVAIST TASIMACILIK';

-- 5/13 抵达佛罗伦萨/卢卡当晚（小曹 5/14 才汇合）
UPDATE transactions SET category='餐饮', note='卢卡 GEST 小消费 (咖啡/小食)', is_shared=FALSE WHERE merchant='GEST SPA' AND trans_date='2026-05-13';
UPDATE transactions SET category='餐饮', note='卢卡 Bar Il Cantuccio 咖啡', is_shared=FALSE WHERE merchant='BAR IL CANTUCCIO';
UPDATE transactions SET category='其他', note='卢卡 GMA Services 杂费', is_shared=FALSE WHERE merchant='GMA SERVICES';
UPDATE transactions SET category='餐饮', note='卢卡 Trattoria Lucchese 晚餐', is_shared=FALSE WHERE merchant='TRATTORIA LUCCHESE';

-- ===== 5/14 卢卡 (与小曹汇合) =====
UPDATE transactions SET category='行李寄存', note='Bounce 行李寄存服务', is_shared=TRUE, share_count=2 WHERE merchant='BOUNCE - USEBOUNCE.COM';
UPDATE transactions SET category='住宿', note='Renaissance Tuscany 卢卡住宿', is_shared=TRUE, share_count=2 WHERE merchant='RENAISSANCE TUSCANY';
UPDATE transactions SET category='交通', note='卢卡公交 AT-Bus', is_shared=TRUE, share_count=2 WHERE merchant='WWW.AT-BUS IT APP';
UPDATE transactions SET category='餐饮', note='卢卡 Panificio Giusti 面包店', is_shared=TRUE, share_count=2 WHERE merchant='PANIFICIO GIUSTI';
UPDATE transactions SET category='景点门票', note='卢卡 Giardino Pfanner 花园门票', is_shared=TRUE, share_count=2 WHERE merchant='GIARDINO PFANNER SRL';
UPDATE transactions SET category='餐饮', note='卢卡 Tambellini 超市购物', is_shared=TRUE, share_count=2 WHERE merchant='SUPERMERCATI TAMBELLINI';

-- ===== 5/15 卢卡 → 五渔村 → 佛罗伦萨 =====
UPDATE transactions SET category='交通', note='托斯卡纳区域公交 (卢卡)', is_shared=TRUE, share_count=2 WHERE merchant='AUTOLINEE TOSCANE' AND trans_date='2026-05-15';
UPDATE transactions SET category='交通', note='Biagiotti 长途巴士/包车 (可能是卢卡-拉斯佩齐亚或五渔村接驳)', is_shared=TRUE, share_count=2 WHERE merchant='AUTOSERVIZI BIAGIOTTI';
UPDATE transactions SET category='餐饮', note='佛罗伦萨 SMN 火车站 Buffet (深夜抵达晚餐/夜宵)', is_shared=TRUE, share_count=2 WHERE merchant='BUFFET FIRENZE S.M.N.';
UPDATE transactions SET category='餐饮', note='五渔村 Cafe I Miracoli', is_shared=TRUE, share_count=2 WHERE merchant='CAFE'' I MIRACOLI';
UPDATE transactions SET category='餐饮', note='马纳罗拉 Piccola Pesca 海鲜', is_shared=TRUE, share_count=2 WHERE merchant='PICCOLA PESCA MANAROLA';

-- ===== 5/16 佛罗伦萨 =====
UPDATE transactions SET category='餐饮', note='Chalet Il Boschetto 小食/饮料', is_shared=TRUE, share_count=2 WHERE merchant='CHALET IL BOSCHETTO';
UPDATE transactions SET category='餐饮', note='Forno Pintucci 佛罗伦萨面包店', is_shared=TRUE, share_count=2 WHERE merchant='FORNO PINTUCCI';
UPDATE transactions SET category='餐饮', note='Budellino 牛肚包/午餐', is_shared=TRUE, share_count=2 WHERE merchant='BUDELLINO GRANO';
UPDATE transactions SET category='餐饮', note='Chiosco del Cocomero 水果/饮料摊', is_shared=TRUE, share_count=2 WHERE merchant='CHIOSCO DEL COCOMERO';
UPDATE transactions SET category='餐饮', note='Il Bargello 37 Rosso 佛罗伦萨晚餐', is_shared=TRUE, share_count=2 WHERE merchant='IL BARGELLO 37 ROSSO';
UPDATE transactions SET category='购物', note='老桥 Ponte Vecchio 周边消费', is_shared=TRUE, share_count=2 WHERE merchant='PONTE VECCHIO';

-- ===== 5/17 佛罗伦萨 → 威尼斯 =====
UPDATE transactions SET category='餐饮', note='佛罗伦萨中央市场 Mercato Centrale', is_shared=TRUE, share_count=2 WHERE merchant='MERCATO CENTRALE FIRENZE';
UPDATE transactions SET category='其他', note='Gruppo LYCC SRLS (餐饮/服务)', is_shared=TRUE, share_count=2 WHERE merchant='GRUPPO LYCC SRLS';
UPDATE transactions SET category='交通', note='托斯卡纳区域公交', is_shared=TRUE, share_count=2 WHERE merchant='AUTOLINEE TOSCANE' AND trans_date='2026-05-17';
UPDATE transactions SET category='行李寄存', note='佛罗伦萨 SMN 火车站行李寄存', is_shared=TRUE, share_count=2 WHERE merchant='CONFID DEP.BAG. FI';
UPDATE transactions SET category='购物', note='Lindt 巧克力 (伴手礼)', is_shared=FALSE WHERE merchant='Lindt Firenze Centro';
UPDATE transactions SET category='餐饮', note='Bar Oltrarno 咖啡', is_shared=TRUE, share_count=2 WHERE merchant='BAR OLTRARNO';

-- ===== 5/18 威尼斯 =====
UPDATE transactions SET category='餐饮', note='威尼斯 S.Giacomo Cicchetti 小食', is_shared=TRUE, share_count=2 WHERE merchant='S.Giacomo';
UPDATE transactions SET category='餐饮', note='Taverna Barababao 威尼斯晚餐', is_shared=TRUE, share_count=2 WHERE merchant='TAVERNA BARABABAO';
UPDATE transactions SET category='通讯', note='Planet Internet 网络/电话卡', is_shared=FALSE WHERE merchant='PLANET INTERNET';
UPDATE transactions SET category='购物', note='Alehop 威尼斯纪念品', is_shared=FALSE WHERE merchant='ALEHOP 419 ITALIA VENECIA';
UPDATE transactions SET category='餐饮', note='Venuda 小饮料', is_shared=TRUE, share_count=2 WHERE merchant='VENUDA SNC';

-- ===== 5/19 威尼斯 → 米兰 =====
UPDATE transactions SET category='交通', note='威尼斯 Confid Station 车站服务', is_shared=TRUE, share_count=2 WHERE merchant='CON.FID. STATION SRL';
UPDATE transactions SET category='餐饮', note='Barcollo 威尼斯餐厅', is_shared=TRUE, share_count=2 WHERE merchant='BARCOLLO DI CHEN XIAO';
UPDATE transactions SET category='行李寄存', note='威尼斯火车站行李寄存', is_shared=TRUE, share_count=2 WHERE merchant='DEP.BAG. VENEZIA S.L.';
UPDATE transactions SET category='餐饮', note='Ristorante Bugande 威尼斯午餐', is_shared=TRUE, share_count=2 WHERE merchant='RISTORANTE BUGANDE''';
UPDATE transactions SET category='交通', note='NTV Italo 高铁 威尼斯-米兰', is_shared=TRUE, share_count=2 WHERE merchant='NTV VENEZIA SL';
UPDATE transactions SET category='餐饮', note='Caffe Vergnano 里亚托店咖啡', is_shared=TRUE, share_count=2 WHERE merchant='CAFFE'' VERGNANO RIAL';

-- ===== 5/20 米兰 → 罗马 =====
UPDATE transactions SET category='取现', note='罗马 Via del Seminario ATM 取现 100.5€', is_shared=FALSE WHERE merchant='VIA DEL SEMINARIO 117';
UPDATE transactions SET category='手续费', note='取现手续费', is_shared=FALSE WHERE merchant='预借现金手续费';
UPDATE transactions SET category='其他', note='Poste Italiane 邮政 (寄明信片/邮票)', is_shared=FALSE WHERE merchant='POSTE ITALIANE';
UPDATE transactions SET category='住宿', note='罗马 Cirulli Anna Maria 住宿/民宿费', is_shared=TRUE, share_count=2 WHERE merchant='CIRULLI ANNA MARIA';
UPDATE transactions SET category='住宿', note='罗马 Guest House Pirelli', is_shared=TRUE, share_count=2 WHERE merchant='GUEST HOUSE PIRELLI';
UPDATE transactions SET category='餐饮', note='Il Vineto 罗马晚餐', is_shared=TRUE, share_count=2 WHERE merchant='IL VINETO';

-- Compute my_share
UPDATE transactions SET my_share = ROUND(rmb_amount::numeric / share_count, 2) WHERE is_trip=TRUE;
