-- 小曹 Chase Sapphire 账单 (2026-05 statement)
-- 只录入意大利行相关交易，币种统一欧元
BEGIN;

WITH cao AS (SELECT id FROM people WHERE name = '小曹'),
     me  AS (SELECT id FROM people WHERE name = '我')
INSERT INTO transactions_v2
  (trans_date, merchant, amount, currency, payer_id, category, note, source, rmb_amount, status)
VALUES
  ('2026-05-07', 'WINDTRE.IT SHOP MILANO',         25.00,   'EUR', (SELECT id FROM cao), '通讯',     '意大利电话卡 (小曹个人)',                'chase_cc', NULL, 'completed'),
  ('2026-05-10', 'BOOKING.COM 酒店',                445.53,  'EUR', (SELECT id FROM cao), '住宿',     'Booking 预订 - 待确认行程关联',           'chase_cc', NULL, 'completed'),
  ('2026-05-15', 'TERENZIANI ERIKA RIOMAGGIORE',   62.25,   'EUR', (SELECT id FROM cao), '餐饮',     '五渔村 Trattoria Enrica 第1笔 ($72.58 / 1.166)', 'chase_cc', NULL, 'completed'),
  ('2026-05-15', 'TERENZIANI ERIKA RIOMAGGIORE',   145.25,  'EUR', (SELECT id FROM cao), '餐饮',     '五渔村 Trattoria Enrica 第2笔 ($169.36 / 1.166)', 'chase_cc', NULL, 'completed'),
  ('2026-05-15', 'PICCOLA PESCA MANAROLA',         27.00,   'EUR', (SELECT id FROM cao), '餐饮',     '马纳罗拉 小曹付的那笔',                  'chase_cc', NULL, 'completed'),
  ('2026-05-16', 'BOOKSHOP GALLERIE DEGLI FIRENZE',10.00,   'EUR', (SELECT id FROM cao), '购物',     '乌菲兹书店',                            'chase_cc', NULL, 'completed'),
  ('2026-05-16', 'CAVLUN SRL FIRENZE',             263.55,  'EUR', (SELECT id FROM cao), '其他',     '佛罗伦萨 CAVLUN SRL ($307.30 / 1.166)',  'chase_cc', NULL, 'completed'),
  ('2026-05-17', 'ARMANDO POGGI FIRENZE',          113.76,  'EUR', (SELECT id FROM cao), '购物',     '佛罗伦萨 Armando Poggi ($132.65 / 1.166)', 'chase_cc', NULL, 'completed'),
  ('2026-05-17', 'REGINA SCONTA SAS VENEZIA',      112.50,  'EUR', (SELECT id FROM cao), '餐饮',     '威尼斯 Regina Sconta',                  'chase_cc', NULL, 'completed'),
  ('2026-05-19', 'KIKO MILANO VENEZIA',            30.47,   'EUR', (SELECT id FROM cao), '购物',     '威尼斯 KIKO 化妆品',                    'chase_cc', NULL, 'completed'),
  ('2026-05-19', 'MOLA VENEZIA',                   22.90,   'EUR', (SELECT id FROM cao), '餐饮',     '威尼斯 Mola',                           'chase_cc', NULL, 'completed'),
  ('2026-05-19', 'VIVIENNE WESTWOOD MILANO',       2055.00, 'EUR', (SELECT id FROM cao), '购物',     '米兰 Vivienne Westwood (小曹个人购物)',  'chase_cc', NULL, 'completed'),
  ('2026-05-19', 'TVM RIALTO DIRETTI 1 VENEZIA',   19.00,   'EUR', (SELECT id FROM cao), '交通',     '威尼斯水上巴士票',                       'chase_cc', NULL, 'completed'),
  ('2026-05-19', 'GUEST HOUSE PIRELLI MILANO',     19.00,   'EUR', (SELECT id FROM cao), '住宿',     '米兰 Guest House 城市税',                'chase_cc', NULL, 'completed'),
  ('2026-05-19', 'SALICE DI ZORZETTO ILARIA',      20.00,   'EUR', (SELECT id FROM cao), '餐饮',     '威尼斯',                                'chase_cc', NULL, 'completed'),
  ('2026-05-19', 'CLESS TICKET ATM MILANO',         2.20,   'EUR', (SELECT id FROM cao), '交通',     '米兰地铁/车票',                         'chase_cc', NULL, 'completed'),
  ('2026-05-20', 'ITALO 米兰→罗马 (小曹)',          195.80,  'EUR', (SELECT id FROM cao), '交通',     '高铁 Italo (小曹付)',                   'chase_cc', NULL, 'completed'),
  ('2026-05-20', 'SALMOIRAGHI&VIGANO MILANO',       95.90,  'EUR', (SELECT id FROM cao), '购物',     '米兰 Salmoiraghi 眼镜店',                'chase_cc', NULL, 'completed'),
  ('2026-05-21', 'KIKO MILANO ROMA',                54.95,  'EUR', (SELECT id FROM cao), '购物',     '罗马 KIKO',                             'chase_cc', NULL, 'completed'),
  ('2026-05-21', 'POSTE ITALIANE ROMA',             31.10,  'EUR', (SELECT id FROM cao), '其他',     '罗马邮政',                              'chase_cc', NULL, 'completed');

COMMIT;
