// Dữ liệu seed công thức nấu ăn — nội dung (mô tả, nguyên liệu, các bước) do
// nhóm tự biên soạn theo kiến thức nấu ăn phổ thông; tên món là tên gọi dân gian.
// Ảnh minh hoạ là ảnh placeholder sinh tự động (xem scripts/gen-placeholder-images.ts).
// Khi có ảnh thật: thay imageUrl bằng URL trong Supabase Storage, giữ nguyên slug.

export type SeedCategory = {
  name: string;
  slug: string;
  description: string;
};

export type SeedRecipe = {
  slug: string;
  title: string;
  categorySlug: string;
  description: string;
  ingredients: string[];
  steps: string[];
  servings: number;
  cookTime: number;
  difficulty: "Dễ" | "Trung bình" | "Khó";
  sourceName?: string;
  sourceUrl?: string;
};

export const CATEGORY_SEED: SeedCategory[] = [
  {
    name: "Món chính",
    slug: "mon-chinh",
    description: "Cơm, bún, phở và các món ăn chính cho bữa cơm gia đình.",
  },
  {
    name: "Món canh",
    slug: "mon-canh",
    description: "Các món canh, súp thanh mát hoặc đậm đà cho bữa cơm thêm trọn vị.",
  },
  {
    name: "Món khai vị",
    slug: "mon-khai-vi",
    description: "Gỏi, nem, salad và món khai vị kích thích vị giác.",
  },
  {
    name: "Món chay",
    slug: "mon-chay",
    description: "Món ăn từ rau củ, đậu hũ, nấm — thanh đạm và dễ nấu.",
  },
  {
    name: "Món ăn vặt",
    slug: "mon-an-vat",
    description: "Bánh, món ăn nhanh cho bữa xế và những buổi tụ tập.",
  },
  {
    name: "Món tráng miệng",
    slug: "mon-trang-mieng",
    description: "Chè, bánh ngọt và món ngọt khép lại bữa ăn.",
  },
  {
    name: "Đồ uống",
    slug: "do-uong",
    description: "Trà, sinh tố, nước ép và thức uống giải nhiệt.",
  },
];

export const RECIPE_SEED: SeedRecipe[] = [
  // ─── Món chính ───
  {
    slug: "com-chien",
    title: "Cơm chiên dương châu",
    categorySlug: "mon-chinh",
    description:
      "Cơm chiên tơi hạt cùng trứng, xúc xích và rau củ — nhanh gọn cho bữa sáng hoặc bữa tối.",
    ingredients: [
      "Cơm nguội 3 chén",
      "Trứng gà 2 quả",
      "Xúc xích 2 cây",
      "Đậu Hà Lan, cà rốt, ngô hạt 1 chén",
      "Hành lá, tỏi băm",
      "Nước mắm, hạt nêm, tiêu",
    ],
    steps: [
      "Đánh tan trứng, chiên vàng rồi xắt sợi nhỏ.",
      "Phi thơm tỏi, xào xúc xích và rau củ khoảng 2 phút.",
      "Cho cơm nguội vào đảo lửa lớn cho hạt cơm tơi ra.",
      "Nêm nước mắm, hạt nêm, tiêu; cho trứng và hành lá vào đảo đều rồi tắt bếp.",
    ],
    servings: 3,
    cookTime: 20,
    difficulty: "Dễ",
  },
  {
    slug: "pho-bo-ha-noi",
    title: "Phở bò Hà Nội",
    categorySlug: "mon-chinh",
    description:
      "Nước dùng trong, thơm mùi hồi quế, bánh phở mềm ăn kèm thịt bò tái và hành lá.",
    ingredients: [
      "Xương ống bò 1kg",
      "Thịt bò bắp và bò tái 500g",
      "Bánh phở 500g",
      "Hành tây 2 củ, gừng 1 nhánh",
      "Hoa hồi, quế, thảo quả, hạt mùi",
      "Nước mắm, muối, đường phèn",
      "Hành lá, ngò gai, giá đỗ, chanh, ớt",
    ],
    steps: [
      "Chần xương bò qua nước sôi để loại bỏ tạp chất rồi rửa sạch.",
      "Nướng hành tây và gừng cho thơm, rang nhẹ các loại gia vị khô.",
      "Hầm xương với nước, hành gừng và gia vị trong 3–4 giờ, hớt bọt thường xuyên.",
      "Nêm nước mắm, muối, đường phèn cho vừa vị rồi lọc lấy nước dùng trong.",
      "Trụng bánh phở, xếp thịt bò mỏng lên trên, chan nước dùng thật nóng.",
      "Dọn kèm hành lá, ngò gai, giá đỗ, chanh và ớt.",
    ],
    servings: 4,
    cookTime: 240,
    difficulty: "Trung bình",
  },
  {
    slug: "thit-kho-trung",
    title: "Thịt kho trứng",
    categorySlug: "mon-chinh",
    description:
      "Ba chỉ heo kho mềm, thấm vị nước dừa và nước mắm, ăn cùng trứng vịt kho và cơm trắng.",
    ingredients: [
      "Thịt ba chỉ 700g",
      "Trứng vịt 6 quả",
      "Nước dừa tươi 1 lít",
      "Nước mắm 4 muỗng",
      "Đường thắng nước màu 2 muỗng",
      "Hành tím, tỏi, tiêu",
    ],
    steps: [
      "Thịt ba chỉ xắt miếng vuông, chần qua nước sôi rồi rửa sạch.",
      "Ướp thịt với nước mắm, đường, hành tỏi băm và tiêu trong 30 phút.",
      "Thắng đường cho lên màu cánh gián rồi cho thịt vào đảo săn.",
      "Đổ nước dừa vào kho lửa nhỏ khoảng 45 phút cho thịt mềm.",
      "Luộc trứng, bóc vỏ rồi cho vào kho thêm 15 phút cho thấm màu.",
    ],
    servings: 4,
    cookTime: 90,
    difficulty: "Dễ",
  },
  {
    slug: "bun-bo-hue",
    title: "Bún bò Huế",
    categorySlug: "mon-chinh",
    description:
      "Nước dùng đậm vị sả và mắm ruốc, ăn kèm bò bắp, chả lụa và chân giò.",
    ingredients: [
      "Xương ống bò 1kg",
      "Bắp bò 400g, chân giò 400g",
      "Sả 4 nhánh, mắm ruốc 2 muỗng",
      "Ớt bột màu điều 1 muỗng",
      "Bún sợi to 500g",
      "Chả lụa, hành tím, gừng",
      "Rau sống, hoa chuối, rau húng quế",
    ],
    steps: [
      "Chần xương và thịt qua nước sôi, rửa sạch rồi hầm lửa nhỏ.",
      "Hòa mắm ruốc với nước, lọc lấy phần nước trong cho vào nồi.",
      "Đập dập sả cho vào nồi, thêm ớt bột màu điều để nước dùng có màu đỏ đẹp.",
      "Hầm 2–3 giờ cho thịt chín mềm, nêm mắm ruốc và muối cho vừa ăn.",
      "Xếp bún, thịt, chả lụa vào tô rồi chan nước dùng sôi.",
    ],
    servings: 4,
    cookTime: 180,
    difficulty: "Trung bình",
  },
  {
    slug: "ga-chien-nuoc-mam",
    title: "Gà chiên nước mắm",
    categorySlug: "mon-chinh",
    description:
      "Cánh gà chiên giòn áo lớp nước mắm tỏi cay ngọt, rất hợp bữa cơm mưa.",
    ingredients: [
      "Cánh gà 600g",
      "Nước mắm 3 muỗng",
      "Đường 2 muỗng",
      "Tỏi băm 1 muỗng",
      "Bột năng 1 muỗng",
      "Dầu ăn, tiêu, ớt băm",
    ],
    steps: [
      "Rửa gà, chần sơ rồi để ráo, ướp chút muối và tiêu.",
      "Lăn gà qua bột năng mỏng rồi chiên vàng giòn, vớt ra để ráo dầu.",
      "Phi tỏi vàng, cho nước mắm, đường và chút nước vào đun sánh.",
      "Cho gà vào đảo lửa lớn cho sốt bám đều rồi rắc tiêu, ớt.",
    ],
    servings: 3,
    cookTime: 30,
    difficulty: "Dễ",
  },
  {
    slug: "com-tam-suon-nuong",
    title: "Cơm tấm sườn nướng",
    categorySlug: "mon-chinh",
    description:
      "Sườn cốt lết ướp mật ong nướng thơm, ăn kèm cơm tấm, trứng và nước mắm chua ngọt.",
    ingredients: [
      "Sườn cốt lết 600g",
      "Cơm tấm 400g",
      "Mật ong 2 muỗng, sả băm 2 muỗng",
      "Nước mắm, đường, tỏi, tiêu",
      "Dưa chua, đồ chua, hành phi",
      "Trứng gà 2 quả",
    ],
    steps: [
      "Dần sườn cho mềm rồi ướp với sả, mật ong, nước mắm, đường, tỏi trong 2 giờ.",
      "Nướng sườn trên than hoặc lò ở nhiệt độ vừa, trở đều hai mặt.",
      "Nấu cơm tấm chín tơi, chiên trứng ốp la.",
      "Pha nước mắm chua ngọt: nước mắm, đường, chanh, tỏi ớt băm.",
      "Xếp cơm, sườn, trứng ra đĩa, rưới nước mắm và rắc hành phi.",
    ],
    servings: 2,
    cookTime: 60,
    difficulty: "Trung bình",
  },

  // ─── Món canh ───
  {
    slug: "canh-chua-ca-loc",
    title: "Canh chua cá lóc",
    categorySlug: "mon-canh",
    description:
      "Vị chua thanh của me hòa với cá lóc tươi ngọt, thêm rau thơm và giá đỗ.",
    ingredients: [
      "Cá lóc 600g",
      "Me chín 100g",
      "Cà chua 2 quả, dứa 1/4 quả",
      "Giá đỗ, đậu bắp, bạc hà",
      "Ngò om, ngò gai, rau răm",
      "Nước mắm, đường, hành tím",
    ],
    steps: [
      "Cá lóc làm sạch, cắt khúc, ướp chút muối và tiêu.",
      "Dầm me với nước sôi, lọc lấy nước chua.",
      "Phi hành, xào cà chua và dứa cho thơm rồi đổ nước vào đun sôi.",
      "Cho cá vào nấu chín, thêm nước me, nêm nước mắm và đường.",
      "Cho rau củ và rau thơm vào, đun sôi lại rồi tắt bếp.",
    ],
    servings: 4,
    cookTime: 35,
    difficulty: "Dễ",
  },
  {
    slug: "canh-mong-toi-tom",
    title: "Canh mồng tơi nấu tôm",
    categorySlug: "mon-canh",
    description:
      "Món canh xanh mát, ngọt vị tôm tươi, nấu nhanh trong 10 phút.",
    ingredients: [
      "Rau mồng tơi 400g",
      "Tôm tươi 200g",
      "Hành tím, dầu ăn",
      "Nước mắm, muối, hạt nêm",
    ],
    steps: [
      "Nhặt và rửa sạch rau mồng tơi, cắt khúc vừa ăn.",
      "Tôm bóc vỏ, băm nhuyễn hoặc để nguyên con.",
      "Phi thơm hành, xào tôm cho săn rồi đổ nước vào đun sôi.",
      "Cho rau vào nấu chín tới, nêm nếm vừa ăn rồi tắt bếp.",
    ],
    servings: 3,
    cookTime: 15,
    difficulty: "Dễ",
  },
  {
    slug: "sup-ga-nam-huong",
    title: "Súp gà nấm hương",
    categorySlug: "mon-canh",
    description:
      "Súp sánh mịn, thơm mùi nấm hương, ấm bụng cho những ngày se lạnh.",
    ingredients: [
      "Ức gà 300g",
      "Nấm hương khô 30g",
      "Trứng gà 1 quả",
      "Bột năng 2 muỗng",
      "Hành tím, ngò rí",
      "Muối, tiêu, đường",
    ],
    steps: [
      "Ngâm nấm hương cho nở, cắt bỏ chân rồi thái sợi.",
      "Luộc ức gà chín, xé sợi nhỏ, giữ lại nước luộc.",
      "Cho nấm vào nước dùng đun sôi, nêm muối và đường.",
      "Hòa bột năng với nước rồi rót từ từ để súp sánh lại.",
      "Đánh tan trứng, rót thành dòng mỏng tạo sợi, rắc ngò rí và tiêu.",
    ],
    servings: 4,
    cookTime: 30,
    difficulty: "Dễ",
  },
  {
    slug: "canh-bi-do-thit-bam",
    title: "Canh bí đỏ thịt băm",
    categorySlug: "mon-canh",
    description:
      "Bí đỏ ngọt bùi nấu cùng thịt băm, món canh dễ ăn cho cả nhà.",
    ingredients: [
      "Bí đỏ 500g",
      "Thịt heo băm 150g",
      "Hành lá, hành tím",
      "Muối, hạt nêm, tiêu",
    ],
    steps: [
      "Gọt vỏ bí đỏ, cắt miếng vừa ăn.",
      "Phi thơm hành, xào thịt băm cho săn.",
      "Cho bí đỏ và nước vào nấu khoảng 15 phút cho bí chín mềm.",
      "Nêm nếm vừa ăn, rắc hành lá và tiêu rồi tắt bếp.",
    ],
    servings: 4,
    cookTime: 25,
    difficulty: "Dễ",
  },
  {
    slug: "canh-rong-bien-dau-hu",
    title: "Canh rong biển đậu hũ",
    categorySlug: "mon-canh",
    description:
      "Canh thanh mát với rong biển và đậu hũ non, thích hợp bữa ăn nhẹ.",
    ingredients: [
      "Rong biển khô 20g",
      "Đậu hũ non 2 miếng",
      "Tôm khô 30g",
      "Hành tím, nước mắm",
    ],
    steps: [
      "Ngâm rong biển cho nở rồi rửa sạch, cắt khúc.",
      "Phi hành tím với tôm khô cho thơm.",
      "Đổ nước vào đun sôi, cho đậu hũ cắt miếng vào nấu nhẹ.",
      "Thêm rong biển, nêm nước mắm vừa ăn rồi tắt bếp ngay để đậu hũ không nát.",
    ],
    servings: 3,
    cookTime: 20,
    difficulty: "Dễ",
  },

  // ─── Món khai vị ───
  {
    slug: "goi-cuon-tom-thit",
    title: "Gỏi cuốn tôm thịt",
    categorySlug: "mon-khai-vi",
    description:
      "Bánh tráng cuốn tôm tươi, thịt luộc và rau sống, chấm tương đậu phộng.",
    ingredients: [
      "Bánh tráng cuốn 200g",
      "Tôm tươi 300g",
      "Thịt ba chỉ 300g",
      "Bún tươi 200g",
      "Xà lách, rau thơm, hẹ",
      "Tương đậu, đậu phộng rang",
    ],
    steps: [
      "Luộc tôm và thịt ba chỉ, để nguội rồi thái lát mỏng.",
      "Rửa sạch rau sống, để ráo nước.",
      "Trải bánh tráng, xếp rau, bún, thịt và tôm rồi cuộn chặt tay.",
      "Pha tương đậu với đường, nước và đậu phộng rang giã nhỏ làm nước chấm.",
    ],
    servings: 4,
    cookTime: 30,
    difficulty: "Dễ",
  },
  {
    slug: "nem-ran",
    title: "Nem rán (chả giò)",
    categorySlug: "mon-khai-vi",
    description:
      "Nem cuốn nhân thịt, mộc nhĩ và rau củ, rán vàng giòn, chấm nước mắm chua ngọt.",
    ingredients: [
      "Bánh đa nem 1 gói",
      "Thịt heo xay 400g",
      "Mộc nhĩ, miến 50g",
      "Cà rốt, hành tây, giá đỗ",
      "Trứng gà 1 quả",
      "Nước mắm, hạt tiêu, hành khô",
    ],
    steps: [
      "Ngâm mộc nhĩ và miến cho mềm, thái nhỏ cùng rau củ.",
      "Trộn thịt xay với rau củ, trứng, nước mắm và tiêu làm nhân.",
      "Cuộn nhân trong bánh đa nem thành cuốn vừa ăn, gấp kín hai đầu.",
      "Rán ngập dầu lửa vừa cho nem chín vàng đều các mặt.",
      "Vớt ra giấy thấm dầu, dọn kèm rau sống và nước mắm chua ngọt.",
    ],
    servings: 4,
    cookTime: 45,
    difficulty: "Trung bình",
  },
  {
    slug: "goi-du-du-tom-kho",
    title: "Gỏi đu đủ tôm khô",
    categorySlug: "mon-khai-vi",
    description:
      "Đu đủ bào giòn trộn tôm khô, đậu phộng và rau thơm, vị chua ngọt hài hòa.",
    ingredients: [
      "Đu đủ xanh 500g",
      "Tôm khô 80g",
      "Đậu phộng rang 50g",
      "Rau thơm, húng quế",
      "Nước mắm, đường, chanh, tỏi ớt",
    ],
    steps: [
      "Bào đu đủ sợi nhỏ, ngâm nước muối loãng rồi vắt ráo.",
      "Rửa tôm khô, rang hoặc chiên sơ cho thơm.",
      "Pha nước trộn gỏi: nước mắm, đường, chanh, tỏi ớt băm.",
      "Trộn đu đủ, tôm khô, rau thơm với nước trộn rồi rắc đậu phộng.",
    ],
    servings: 4,
    cookTime: 25,
    difficulty: "Dễ",
  },
  {
    slug: "salad-dau-giam",
    title: "Salad dầu giấm",
    categorySlug: "mon-khai-vi",
    description:
      "Rau củ tươi giòn trộn dầu giấm nhẹ, dùng kèm bữa Âu hoặc ăn nhẹ buổi tối.",
    ingredients: [
      "Xà lách 200g",
      "Cà chua bi 150g",
      "Dưa leo 1 quả",
      "Hành tây tím 1/2 củ",
      "Dầu ô liu 3 muỗng",
      "Giấm táo 2 muỗng, mật ong 1 muỗng",
    ],
    steps: [
      "Rửa sạch rau củ, ngâm nước đá cho giòn rồi vớt ráo.",
      "Cắt cà chua bi đôi, dưa leo lát mỏng, hành tây thái mỏng.",
      "Pha dầu giấm với mật ong, chút muối và tiêu.",
      "Trộn đều tất cả trước khi dùng để rau không bị mềm.",
    ],
    servings: 3,
    cookTime: 15,
    difficulty: "Dễ",
  },

  // ─── Món chay ───
  {
    slug: "dau-hu-sot-ca-chua",
    title: "Đậu hũ sốt cà chua",
    categorySlug: "mon-chay",
    description:
      "Đậu hũ chiên vàng om sốt cà chua đậm đà, món chay quen thuộc cho bữa cơm.",
    ingredients: [
      "Đậu hũ 4 miếng",
      "Cà chua 3 quả",
      "Hành tím, hành lá",
      "Nước tương, đường, tiêu",
    ],
    steps: [
      "Cắt đậu hũ thành miếng vuông, chiên vàng đều các mặt.",
      "Băm nhỏ hành tím, xào cà chua cho nhuyễn và lên màu đỏ đẹp.",
      "Cho chút nước, nêm nước tương và đường vừa ăn.",
      "Cho đậu hũ vào om lửa nhỏ 5 phút cho thấm sốt, rắc hành lá.",
    ],
    servings: 3,
    cookTime: 25,
    difficulty: "Dễ",
  },
  {
    slug: "rau-cu-xao-nam",
    title: "Rau củ xào nấm",
    categorySlug: "mon-chay",
    description:
      "Bông cải, cà rốt và nấm xào nhanh lửa lớn, giữ độ giòn ngọt tự nhiên.",
    ingredients: [
      "Bông cải xanh 300g",
      "Cà rốt 1 củ",
      "Nấm rơm hoặc nấm đùi gà 200g",
      "Tỏi băm, dầu hào chay",
      "Muối, đường, tiêu",
    ],
    steps: [
      "Cắt rau củ thành miếng vừa ăn, chần sơ qua nước sôi có chút muối.",
      "Phi thơm tỏi, cho nấm vào xào trước cho ra nước.",
      "Cho rau củ vào xào lửa lớn khoảng 3 phút.",
      "Nêm dầu hào chay, đường và tiêu, đảo đều rồi tắt bếp.",
    ],
    servings: 3,
    cookTime: 20,
    difficulty: "Dễ",
  },
  {
    slug: "bun-xao-chay",
    title: "Bún xào chay thập cẩm",
    categorySlug: "mon-chay",
    description:
      "Bún xào cùng nấm, đậu hũ và rau củ, món chay no bụng mà không ngán.",
    ingredients: [
      "Bún tươi 400g",
      "Đậu hũ 2 miếng",
      "Nấm hương 50g, cà rốt, cải ngọt",
      "Giá đỗ 150g",
      "Nước tương, dầu hào chay",
    ],
    steps: [
      "Chiên đậu hũ vàng rồi cắt miếng nhỏ.",
      "Xào nấm và rau củ với nước tương cho chín tới.",
      "Cho bún vào đảo cùng lửa lớn, thêm dầu hào chay.",
      "Cho giá đỗ vào sau cùng, đảo nhanh rồi tắt bếp để giá còn giòn.",
    ],
    servings: 3,
    cookTime: 25,
    difficulty: "Dễ",
  },
  {
    slug: "canh-du-du-chay",
    title: "Canh đu đủ chay",
    categorySlug: "mon-chay",
    description:
      "Canh đu đủ nấu nấm và đậu hũ, vị ngọt thanh nhẹ nhàng.",
    ingredients: [
      "Đu đủ xanh 400g",
      "Đậu hũ 2 miếng",
      "Nấm rơm 100g",
      "Hành tím, ngò rí",
      "Muối, hạt nêm chay",
    ],
    steps: [
      "Gọt vỏ đu đủ, cắt miếng vừa ăn.",
      "Phi thơm hành, cho đu đủ vào xào sơ.",
      "Đổ nước vào nấu cho đu đủ chín mềm.",
      "Thêm nấm và đậu hũ, nêm hạt nêm chay rồi rắc ngò rí.",
    ],
    servings: 3,
    cookTime: 25,
    difficulty: "Dễ",
  },
  {
    slug: "dau-hu-chien-sa-ot",
    title: "Đậu hũ chiên sả ớt",
    categorySlug: "mon-chay",
    description:
      "Đậu hũ chiên giòn rim sả ớt cay thơm, ăn kèm cơm trắng rất bắt vị.",
    ingredients: [
      "Đậu hũ 4 miếng",
      "Sả 3 nhánh, ớt 2 quả",
      "Nước tương 3 muỗng",
      "Đường 1 muỗng",
      "Tỏi băm, dầu ăn",
    ],
    steps: [
      "Đậu hũ cắt miếng vừa ăn, chiên vàng giòn rồi vớt ra.",
      "Băm nhuyễn sả, ớt và tỏi.",
      "Phi thơm hỗn hợp sả ớt, thêm nước tương và đường đun sánh.",
      "Cho đậu hũ vào rim lửa nhỏ cho sốt bám đều rồi tắt bếp.",
    ],
    servings: 3,
    cookTime: 25,
    difficulty: "Dễ",
  },

  // ─── Món ăn vặt ───
  {
    slug: "banh-mi-trung-op-la",
    title: "Bánh mì trứng ốp la",
    categorySlug: "mon-an-vat",
    description:
      "Bữa sáng nhanh gọn với trứng ốp la, xúc xích và bánh mì giòn.",
    ingredients: [
      "Bánh mì 2 ổ",
      "Trứng gà 2 quả",
      "Xúc xích 2 cây",
      "Bơ, tương ớt, tiêu",
      "Dưa leo, ngò rí",
    ],
    steps: [
      "Chiên trứng ốp la lòng đào, rắc chút tiêu.",
      "Chiên xúc xích cho chín vàng.",
      "Nướng bánh mì cho giòn, phết bơ mỏng.",
      "Kẹp trứng, xúc xích, dưa leo vào bánh mì rồi rưới tương ớt.",
    ],
    servings: 1,
    cookTime: 10,
    difficulty: "Dễ",
  },
  {
    slug: "banh-xeo-mien-trung",
    title: "Bánh xèo miền Trung",
    categorySlug: "mon-an-vat",
    description:
      "Bánh xèo vỏ giòn rụm, nhân tôm thịt và giá đỗ, cuốn rau sống chấm nước mắm.",
    ingredients: [
      "Bột bánh xèo 200g",
      "Nước cốt dừa 100ml",
      "Tôm 150g, thịt ba chỉ 150g",
      "Giá đỗ, hành lá",
      "Nghệ, muối, dầu ăn",
      "Rau sống, nước mắm chua ngọt",
    ],
    steps: [
      "Pha bột bánh xèo với nước, nước cốt dừa, chút nghệ và muối, để nghỉ 30 phút.",
      "Xào sơ tôm và thịt với hành.",
      "Tráng bột mỏng trên chảo nóng, cho nhân và giá đỗ vào một nửa bánh.",
      "Đậy nắp cho bánh chín giòn rồi gấp đôi lại.",
      "Dọn bánh nóng cùng rau sống và nước mắm chua ngọt.",
    ],
    servings: 3,
    cookTime: 40,
    difficulty: "Trung bình",
  },
  {
    slug: "ha-cao-hap",
    title: "Há cảo hấp",
    categorySlug: "mon-an-vat",
    description:
      "Vỏ há cảo dai mềm, nhân tôm thịt ngọt thơm, chấm xì dầu giấm.",
    ingredients: [
      "Bột há cảo 200g",
      "Tôm 250g, thịt heo xay 150g",
      "Hành lá, gừng",
      "Xì dầu, dầu mè, tiêu",
    ],
    steps: [
      "Nhào bột với nước nóng già rồi ủ 30 phút cho bột mềm.",
      "Trộn tôm băm với thịt, hành, gừng và gia vị làm nhân.",
      "Cán bột mỏng, cho nhân vào và gấp viền thành hình há cảo.",
      "Hấp 10 phút trên lửa lớn, dọn kèm xì dầu pha giấm.",
    ],
    servings: 4,
    cookTime: 50,
    difficulty: "Trung bình",
  },
  {
    slug: "banh-trang-tron",
    title: "Bánh tráng trộn",
    categorySlug: "mon-an-vat",
    description:
      "Bánh tráng cắt sợi trộn đều với tôm khô, trứng cút và xoài xanh.",
    ingredients: [
      "Bánh tráng trộn 200g",
      "Tôm khô 50g",
      "Trứng cút 10 quả",
      "Xoài xanh 1 quả",
      "Sa tế, dầu hành, đậu phộng",
      "Muối tôm, đường",
    ],
    steps: [
      "Trứng cút luộc chín, bóc vỏ; xoài xanh bào sợi.",
      "Xịt nước lên bánh tráng cho mềm vừa, cắt sợi.",
      "Trộn bánh tráng với tôm khô, xoài, trứng cút và sa tế.",
      "Nêm muối tôm, đường, dầu hành rồi rắc đậu phộng lên trên.",
    ],
    servings: 2,
    cookTime: 20,
    difficulty: "Dễ",
  },
  {
    slug: "banh-khot",
    title: "Bánh khọt",
    categorySlug: "mon-an-vat",
    description:
      "Bánh khọt nhỏ xinh, vỏ ngoài giòn trong mềm, ăn kèm rau sống và nước mắm.",
    ingredients: [
      "Bột gạo 200g, bột nghệ 1 muỗng",
      "Nước cốt dừa 150ml",
      "Tôm 150g",
      "Đậu xanh hấp 100g",
      "Hành lá, dầu ăn",
    ],
    steps: [
      "Pha bột gạo với nước cốt dừa, nghệ và chút muối, để nghỉ 30 phút.",
      "Đổ bột vào khuôn bánh khọt đã nóng dầu.",
      "Cho tôm và đậu xanh lên mỗi bánh.",
      "Đậy nắp cho bánh chín vàng, rắc hành lá rồi gỡ ra đĩa.",
    ],
    servings: 4,
    cookTime: 45,
    difficulty: "Trung bình",
  },

  // ─── Món tráng miệng ───
  {
    slug: "banh-flan-caramel",
    title: "Bánh flan caramel",
    categorySlug: "mon-trang-mieng",
    description:
      "Bánh flan mềm mịn béo nhẹ vị trứng sữa, phủ lớp caramel thơm đắng ngọt.",
    ingredients: [
      "Trứng gà 4 quả",
      "Sữa tươi 400ml",
      "Sữa đặc 100g",
      "Đường 80g",
      "Vani 1 muỗng cà phê",
    ],
    steps: [
      "Thắng đường với chút nước cho lên màu cánh gián rồi tráng đáy khuôn.",
      "Đun sữa tươi với sữa đặc cho ấm, để nguội bớt.",
      "Đánh nhẹ trứng với vani rồi hòa vào hỗn hợp sữa, lọc qua rây.",
      "Đổ khuôn, hấp cách thủy hoặc nướng cách thủy ở 150°C khoảng 40 phút.",
      "Để nguội, làm lạnh rồi úp bánh ra đĩa.",
    ],
    servings: 6,
    cookTime: 60,
    difficulty: "Trung bình",
  },
  {
    slug: "che-ba-mau",
    title: "Chè ba màu",
    categorySlug: "mon-trang-mieng",
    description:
      "Đậu xanh, đậu đỏ và thạch lá dứa ba tầng màu, chan nước cốt dừa béo ngậy.",
    ingredients: [
      "Đậu xanh cà 150g",
      "Đậu đỏ 150g",
      "Bột rau câu 10g, lá dứa",
      "Nước cốt dừa 300ml",
      "Đường 200g",
    ],
    steps: [
      "Ngâm đậu đỏ qua đêm rồi hấp chín, tán nhuyễn với đường.",
      "Đậu xanh hấp chín, tán nhuyễn và nêm đường.",
      "Nấu thạch rau câu với nước lá dứa, để nguội rồi cắt sợi.",
      "Nấu nước cốt dừa với chút đường và muối.",
      "Xếp ba lớp vào ly, chan nước cốt dừa lên trên và thêm đá.",
    ],
    servings: 4,
    cookTime: 60,
    difficulty: "Dễ",
  },
  {
    slug: "rau-cau-dua",
    title: "Rau câu dừa",
    categorySlug: "mon-trang-mieng",
    description:
      "Thạch rau câu dai giòn vị dừa tươi, mát lạnh cho ngày nóng.",
    ingredients: [
      "Bột rau câu 10g",
      "Nước dừa tươi 800ml",
      "Cơm dừa non 100g",
      "Đường 120g",
    ],
    steps: [
      "Ngâm bột rau câu với nước dừa 15 phút cho nở.",
      "Đun hỗn hợp với đường, khuấy đều cho bột tan hết.",
      "Cho cơm dừa non vào khuôn.",
      "Rót thạch vào khuôn, để nguội rồi làm lạnh cho thạch đông lại.",
    ],
    servings: 6,
    cookTime: 25,
    difficulty: "Dễ",
  },
  {
    slug: "banh-chuoi-nuong",
    title: "Bánh chuối nướng",
    categorySlug: "mon-trang-mieng",
    description:
      "Chuối chín ngọt quyện nước cốt dừa và bánh mì, nướng lên thơm bùi.",
    ingredients: [
      "Chuối chín 6 quả",
      "Bánh mì 3 lát",
      "Nước cốt dừa 200ml",
      "Sữa đặc 100g",
      "Bơ, đường, vani",
    ],
    steps: [
      "Cắt chuối lát mỏng, bánh mì cắt nhỏ.",
      "Trộn chuối với sữa đặc, nước cốt dừa và vani.",
      "Trộn bánh mì vào hỗn hợp cho hỗn hợp kết dính.",
      "Đổ vào khuôn có phết bơ, nướng 170°C khoảng 40 phút cho mặt vàng.",
    ],
    servings: 6,
    cookTime: 55,
    difficulty: "Dễ",
  },

  // ─── Đồ uống ───
  {
    slug: "tra-dao-cam-sa",
    title: "Trà đào cam sả",
    categorySlug: "do-uong",
    description:
      "Trà đen thơm hòa cùng đào ngâm, cam tươi và sả, giải nhiệt sảng khoái.",
    ingredients: [
      "Trà đen túi lọc 2 gói",
      "Đào ngâm 1 hộp",
      "Cam vàng 1 quả",
      "Sả 2 nhánh",
      "Đường, đá viên",
    ],
    steps: [
      "Hãm trà đen với nước nóng 5 phút rồi lọc bỏ bã.",
      "Đập dập sả, đun với chút nước và đường cho thơm rồi lọc lấy nước sả.",
      "Pha trà với nước sả và nước đào ngâm, nêm vừa ngọt.",
      "Thêm lát cam, miếng đào và đá viên trước khi dùng.",
    ],
    servings: 3,
    cookTime: 20,
    difficulty: "Dễ",
  },
  {
    slug: "sinh-to-bo",
    title: "Sinh tố bơ",
    categorySlug: "do-uong",
    description:
      "Bơ sáp béo mịn xay cùng sữa đặc, thức uống bổ dưỡng cho bữa sáng.",
    ingredients: [
      "Bơ sáp 2 quả",
      "Sữa đặc 3 muỗng",
      "Sữa tươi 200ml",
      "Đá viên",
    ],
    steps: [
      "Bơ gọt vỏ, bỏ hạt, cắt miếng.",
      "Cho bơ, sữa đặc, sữa tươi và đá vào máy xay.",
      "Xay nhuyễn đến khi hỗn hợp mịn đều.",
      "Rót ra ly, trang trí thêm lát bơ nếu thích.",
    ],
    servings: 2,
    cookTime: 10,
    difficulty: "Dễ",
  },
  {
    slug: "nuoc-chanh-day-hat-chia",
    title: "Nước chanh dây hạt chia",
    categorySlug: "do-uong",
    description:
      "Chanh dây chua ngọt kết hợp hạt chia, uống mát và tốt cho tiêu hoá.",
    ingredients: [
      "Chanh dây 3 quả",
      "Hạt chia 1 muỗng",
      "Đường hoặc mật ong 3 muỗng",
      "Nước lọc 600ml",
      "Đá viên",
    ],
    steps: [
      "Ngâm hạt chia với nước 10 phút cho nở.",
      "Lọc lấy nước chanh dây, giữ lại một ít hạt.",
      "Pha nước chanh dây với nước lọc và đường cho vừa vị.",
      "Cho hạt chia và đá vào, khuấy đều trước khi uống.",
    ],
    servings: 3,
    cookTime: 15,
    difficulty: "Dễ",
  },
  {
    slug: "ca-phe-sua-da",
    title: "Cà phê sữa đá",
    categorySlug: "do-uong",
    description:
      "Cà phê phin đậm vị hòa cùng sữa đặc, thêm đá cho ly cà phê đúng điệu.",
    ingredients: [
      "Cà phê xay 25g",
      "Sữa đặc 3 muỗng",
      "Nước sôi 100ml",
      "Đá viên",
    ],
    steps: [
      "Cho cà phê vào phin, tráng qua nước sôi rồi chắt bỏ nước đầu.",
      "Rót nước sôi vào phin, đậy nắp và chờ cà phê nhỏ giọt.",
      "Cho sữa đặc vào ly, rót cà phê nóng vào và khuấy đều.",
      "Thêm đá viên và khuấy lại trước khi dùng.",
    ],
    servings: 1,
    cookTime: 15,
    difficulty: "Dễ",
  },
];
