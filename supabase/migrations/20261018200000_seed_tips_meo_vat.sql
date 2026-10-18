-- Seed 12 bài mẹo vặt nấu ăn (viết lại bằng lời của mình, đã gỡ tên thương hiệu).
-- Idempotent: chạy lại nhiều lần an toàn nhờ ON CONFLICT (slug).
-- Merge vào dev là Supabase GitHub integration tự chạy.

insert into public.tips (title, slug, excerpt, content, image_url, is_published)
values
    ('5 cách kho cá trê đậm đà, thịt chắc không còn mùi tanh', 'meo-kho-ca-tre-khong-tanh', 'Từ khâu làm sạch nhớt đến cách giữ lửa liu riu, những bí quyết dưới đây giúp nồi cá kho trê của bạn thơm nức, thịt săn chắc và thấm vị.', '## 1. Làm sạch thật kỹ — bước quyết định

Cá trê nhiều nhớt nên cần sơ chế cẩn thận: chà xát toàn thân với muối hạt, sau đó dùng nước cốt chanh hoặc giấm, gừng đập dập và một chút rượu trắng để khử mùi tanh. Rửa lại nhiều lần cho đến khi da cá hết trơn nhớt. Đây là khâu quan trọng nhất, quyết định mùi vị của cả nồi cá kho.

## 2. Ướp và sơ chế trước khi kho

Ướp cá với gia vị khoảng 30 phút cho thấm đều. Trước khi kho, nên chiên sơ hoặc xào săn cá để thịt chắc, không bị nát trong quá trình kho. Chọn nồi đất hoặc nồi đáy dày để giữ nhiệt ổn định, cá chín đều từ trong ra ngoài.

## 3. Kho lửa nhỏ, hạn chế đảo

Kho trên lửa nhỏ liu riu. Tránh đảo cá nhiều lần; thay vào đó chỉ lắc nhẹ nồi hoặc múc nước kho rưới đều lên mặt cá. Cách này giúp cá thấm vị mà vẫn giữ nguyên miếng, không bị nát.

## 4. Năm biến tấu gợi ý

- **Kho tộ miền Nam**: nước dừa tạo màu nâu cánh gián, vị ngọt dịu.
- **Kho tiêu**: cay nồng, hợp ăn cùng cơm nóng.
- **Kho gừng nghệ**: gừng và nghệ át hẳn mùi tanh.
- **Kho dưa chua**: dưa chua chống ngấy, vị đậm đà.
- **Kho rau răm**: thơm lạ miệng, đổi vị cho cả nhà.

(Tóm tắt từ monngonmoingay.com)', null, true),
    ('Bí quyết chọn và nướng cá lóc thơm ngon tại nhà', 'cach-lam-ca-loc-nuong-ngon', 'Chọn cá lóc đồng tươi sống, khử nhớt đúng cách và nướng lửa vừa là ba chìa khóa để có món cá lóc nướng da giòn, thịt ngọt.', '## 1. Chọn cá tươi ngon

Nên chọn cá lóc đồng còn sống, bơi khỏe, thân dài và da bóng, trọng lượng khoảng 600g đến 1kg. Cá tươi có mắt trong, mang đỏ tươi và không có mùi lạ. Cá tươi là yếu tố quyết định độ ngọt của thịt sau khi nướng.

## 2. Sơ chế khử nhớt, khử tanh

Chà muối hạt thật kỹ khắp thân cá để lấy hết nhớt, sau đó chà thêm nước cốt chanh hoặc giấm. Có thể dội nhanh nước nóng khoảng 70–80°C rồi cạo sạch. Dùng khăn giấy thấm khô toàn bộ bề mặt cá trước khi ướp — da khô giúp khi nướng được vàng giòn.

## 3. Ướp gia vị

Khứa vài đường chéo trên thân cá (không quá sâu để thịt không bị nát), ướp với sả, gừng, nghệ, tỏi và ớt khoảng 30 phút đến 1 tiếng. Quét một lớp dầu mỏng lên thân cá trước khi đưa lên bếp nướng.

## 4. Nướng đúng lửa

Nướng trên than hồng, lửa vừa và không để ngọn lửa bén trực tiếp vào cá. Chỉ trở mặt 1–2 lần cho chín đều hai bên. Kiểm tra độ chín bằng cách xiên đũa vào phần thịt dày sát xương.

## 5. Tám cách nướng gợi ý

Nướng trui, nướng muối ớt, nướng ớt xiêm xanh, nướng sả nghệ, nướng mỡ hành, bọc lá chuối, bọc giấy bạc, hoặc dùng nồi chiên không dầu cho tiện lợi.

(Tóm tắt từ monngonmoingay.com)', null, true),
    ('8 món ngon từ ốc bươu và mẹo sơ chế sạch bùn đất', 'mon-ngon-tu-oc-buou', 'Ốc bươu ngọt thịt nhưng cần sơ chế kỹ để sạch bùn đất và loại bỏ nhớt. Dưới đây là cách làm sạch cùng 8 món gợi ý hấp dẫn.', '## 1. Sơ chế sạch nhớt, sạch bùn

Ngâm ốc trong nước vo gạo có thêm vài lát ớt khoảng 2–3 tiếng để ốc nhả hết bùn đất. Dùng bàn chải chà sạch vỏ. Sau khi luộc sơ, bóp thịt ốc với muối và giấm cho hết nhớt. Luộc ốc cùng gừng và sả đập dập để khử mùi tanh. Nhớ bỏ phần ruột đen và nắp ốc.

## 2. Tám món gợi ý

- Ốc bươu kho gừng
- Ốc hấp sả gừng
- Chả ốc chiên vàng giòn
- Chả ốc nướng lá lốt
- Canh ốc nấu mồng tơi với mướp
- Ốc xào sả ớt
- Canh ốc thì là nấu chua
- Lẩu ốc thả

## 3. Lưu ý an toàn

Luôn nấu ốc thật chín kỹ, tuyệt đối không ăn ốc sống hoặc tái vì nguy cơ nhiễm ký sinh trùng. Loại bỏ những con ốc đã chết hoặc có mùi hôi, chọn mua ở nơi uy tín. Ốc tính hàn nên ăn lượng vừa phải và ăn kèm gừng, sả cho cân bằng. Sau khi sơ chế ốc sống, nhớ rửa tay và dụng cụ thật kỹ.

(Tóm tắt từ monngonmoingay.com)', null, true),
    ('Măng tươi xào gì ngon? 8 món xào và cách bảo quản', 'mang-tuoi-xao-ngon-bao-quan', 'Măng tươi giòn ngon khi được sơ chế hết đắng và xào nhanh trên lửa lớn. Xem ngay 8 món xào gợi ý cùng cách bảo quản măng đúng cách.', '## 1. Sơ chế măng

Luộc măng nhiều lần cho đến khi nước trong và hết vị đắng. Trước khi xào, để măng thật ráo nước — măng còn ướt sẽ làm bắn dầu và khó thấm gia vị.

## 2. Kỹ thuật xào giữ độ giòn

Xào trên lửa lớn trong thời gian ngắn. Nên xào riêng thịt hoặc hải sản trước, sau đó mới trộn chung với măng. Nêm gia vị khi măng đã săn mặt. Đừng xào quá lâu vì măng sẽ dai và mất độ giòn.

## 3. Tám món măng xào gợi ý

Xào với thịt bò, thịt ba chỉ, lá lốt, tôm, tỏi, nấm, ếch hoặc lòng gà. Kết hợp thêm rau thơm như sả, lá lốt, rau răm để át mùi hăng đặc trưng của măng.

## 4. Cách bảo quản

- Măng nguyên vỏ: để 1–2 ngày ở nơi khô ráo, thoáng mát.
- Đã bóc vỏ: cho vào túi hoặc hộp kín, giữ ngăn mát 3–5 ngày.
- Măng đã luộc: ngâm ngập nước trong hộp kín ở ngăn mát, thay nước đều đặn; hoặc chia phần cấp đông.

## 5. Lưu ý

Không ăn măng sống hoặc măng luộc chưa kỹ vì có thể chứa hợp chất sinh cyanide gây ngộ độc. Bỏ ngay măng bị nhớt, mốc hoặc có mùi chua lạ.

(Tóm tắt từ monngonmoingay.com)', null, true),
    ('9 cách làm chả chay ngon cho ngày rằm và lễ Phật', 'cach-lam-cha-chay-ngon', 'Từ chả lụa chay truyền thống đến chả cốm kiểu Hà Nội, bạn có thể tự làm nhiều loại chả chay thơm ngon tại nhà với nguyên liệu đơn giản.', '## 1. Nguyên liệu nền

Đậu hũ và tàu hũ ky giàu đạm thực vật, tạo độ béo nhẹ; mì căn cho độ dai tự nhiên; các loại nấm, đậu xanh, khoai môn, rau củ tạo hương vị. Dùng bột năng hoặc bột mì làm chất kết dính, nêm bằng nước tương, hạt nêm chay, tiêu và dầu mè.

## 2. Chín loại chả gợi ý

- Chả lụa chay truyền thống
- Chả hấp chay thanh đạm
- Chả đậu hũ chiên
- Chả quế chay
- Chả nấm áp chảo
- Chả lá lốt chay
- Chả cá chay từ khoai môn
- Chả rau củ ngũ sắc
- Chả cốm chay kiểu Hà Nội

## 3. Chiên giòn không thấm dầu

Vắt nguyên liệu thật ráo trước khi trộn, áo một lớp bột mỏng bên ngoài, chiên ở nhiệt độ 160–170°C, không cho quá nhiều vào chảo cùng lúc. Vớt ra để ráo trên giá hoặc rổ trước khi lót giấy thấm dầu.

## 4. Bảo quản

Để chả nguội hoàn toàn rồi bọc kín từng phần. Chả hấp dùng trong vài ngày ở ngăn mát; chả chưa chiên có thể cấp đông. Chả dùng cúng rằm, lễ Phật nên để riêng khu vực với thực phẩm mặn và hạn chế dùng hành, tỏi, hẹ, kiệu.

(Tóm tắt từ monngonmoingay.com)', null, true),
    ('Bí quyết nấu bún riêu cua: nước trong, riêu đóng mảng đẹp', 'cach-nau-bun-rieu-cua-ngon', 'Riêu đóng thành mảng, nước dùng trong và thơm là thước đo của nồi bún riêu cua ngon. Học ngay bí quyết xử lý cua và điều chỉnh lửa.', '## 1. Năm phiên bản phổ biến

- Bún riêu cua truyền thống với giấm bỗng
- Bún riêu cua xí quách béo bùi
- Bún riêu cua bắp bò
- Bún riêu cua kiểu miền Nam thêm huyết, chả và riêu thịt
- Bún riêu cua kiểu miền Bắc thanh nhẹ

## 2. Bí quyết nước trong, riêu đóng mảng

Lọc nước cua qua rây hai lần cho sạch cặn. Thêm một chút muối trước khi nấu. Lúc đầu khuấy nhẹ, đến khi riêu bắt đầu nổi thì ngừng khuấy hẳn. Duy trì lửa vừa đến nhỏ và hớt bọt thường xuyên.

## 3. Lỗi thường gặp và cách tránh

- Riêu không đóng mảng: nước cua quá loãng.
- Riêu vỡ vụn: đun sôi quá mạnh hoặc đảo nhiều.
- Nước đục: không hớt bọt kỹ.
- Nước tanh: cua không tươi.

## 4. Nêm vị chua vừa miệng

Cho các nguyên liệu tạo vị chua như giấm bỗng, me hoặc tắc từng ít một, vừa thêm vừa nếm. Sau khi cho riêu trở lại nồi, chỉ đun nhỏ lửa, không đun lâu để riêu giữ nguyên mảng đẹp mắt.

(Tóm tắt từ monngonmoingay.com)', null, true),
    ('20 gợi ý mâm cơm gia đình 4 người đủ chất, tiết kiệm', 'mam-com-gia-dinh-tiet-kiem', 'Mỗi mâm cơm chỉ cần đủ ba nhóm món: món mặn, món rau và món canh. Tham khảo 20 gợi ý kết hợp cùng mẹo đi chợ tiết kiệm.', '## 1. Công thức mâm cơm cân đối

Mỗi mâm cơm nên có đủ ba nhóm: món mặn, món rau (luộc, xào hoặc gỏi) và món canh, tổng cộng 4–5 món. Một số gợi ý: thịt kho trứng, cá kho tiêu, tôm hấp sả, gà kho gừng, canh chua cá lóc... Luân phiên thịt heo, bò, gà, cá, tôm, mực và đậu hũ trong tuần để bữa ăn đa dạng, không nhàm chán.

## 2. Lên thực đơn trước cả tuần

Viết sẵn thực đơn cho cả tuần, liệt kê đầy đủ nguyên liệu rồi đi chợ một lần. Cách này tiết kiệm cả thời gian lẫn tiền bạc. Ưu tiên chọn nguyên liệu theo mùa vừa tươi vừa rẻ.

## 3. Sắp xếp thứ tự nấu hợp lý

Nấu trước những món cần nhiều thời gian như kho, hầm hay luộc gà; trong lúc chờ thì tranh thủ sơ chế các món khác. Kết hợp món cầu kỳ với món luộc hoặc rau đơn giản cho đỡ vất vả.

## 4. Tận dụng thực phẩm còn lại

Cơm nguội có thể làm cơm chiên, thịt luộc còn dư đem trộn gỏi. Tận dụng khéo léo giúp giảm lãng phí mà vẫn có món ngon đổi vị cho cả nhà.

(Tóm tắt từ monngonmoingay.com)', null, true),
    ('Cách làm bò bít tết tại nhà mềm ngon như nhà hàng', 'cach-lam-bo-bit-tet-tai-nha', 'Chọn đúng phần thịt, áp chảo đúng nhiệt và để thịt nghỉ trước khi cắt là ba bí quyết để miếng bít tết mềm mọng nước.', '## 1. Chọn phần thịt phù hợp

Thăn nội là phần mềm nhất; thăn ngoại và đầu thăn ngoại có vân mỡ xen kẽ nên mọng nước; lõi vai đậm đà với giá dễ chịu hơn. Ưu tiên miếng thịt có vân mỡ xen giữa các thớ.

## 2. Chuẩn bị trước khi áp chảo

Để thịt bớt lạnh khoảng 20–30 phút ở nhiệt độ phòng, thấm khô bề mặt bằng khăn giấy. Ướp đơn giản với muối và tiêu khoảng 15–20 phút. Làm nóng già chảo đáy dày trước khi cho thịt vào; trong lúc áp chảo không lật thịt liên tục. Thêm bơ lạt và tỏi vào phút cuối để tăng hương thơm.

## 3. Để thịt nghỉ và cắt đúng cách

Sau khi áp chảo, để thịt nghỉ khoảng 5 phút cho nước thịt phân bố đều. Cắt ngang thớ (vuông góc với đường thớ) giúp miếng thịt mềm, dễ nhai. Không dùng nĩa đâm vào thịt để tránh làm mất nước ngọt.

## 4. Năm loại sốt gợi ý

Sốt tiêu đen, bít tết kiểu Việt Nam, sốt nấm bơ béo ngậy, sốt vang đỏ kiểu Tây, hoặc nướng mật ong. Điều chỉnh độ chín theo khẩu vị và dùng ngay khi còn nóng.

(Tóm tắt từ monngonmoingay.com)', null, true),
    ('Nấm kim châm: giá trị dinh dưỡng và 12 món ngon dễ làm', 'mon-ngon-tu-nam-kim-cham', 'Nấm kim châm ít calo, giàu chất xơ và khoáng chất, rất hợp với người ăn kiêng. Khám phá 12 cách chế biến cùng mẹo sơ chế, bảo quản.', '## 1. Giá trị dinh dưỡng

Trong 100g nấm kim châm sống có khoảng 37 kcal, 2,66g protein và 2,7g chất xơ, giàu kali, vitamin nhóm B, phốt pho, sắt và magie. Nấm ít chất béo, bổ sung chất xơ hỗ trợ tiêu hóa nên phù hợp với người đang kiểm soát cân nặng.

## 2. Mười hai món gợi ý

Chiên giòn xốt tương, bò cuộn áp chảo, cuộn rong biển, xào bơ tỏi, canh thịt bằm, lẩu thập cẩm, xào trứng, kho sa tế, súp đậu hũ non, nướng mỡ hành kiểu Hàn, bún xào chay và cơm chiên.

## 3. Sơ chế đúng cách

Cắt gốc khi nấm còn trong bao bì, tách nhẹ tay thành từng chùm nhỏ. Rửa nhanh, không ngâm lâu vì nấm rất dễ hút nước, sau đó để thật ráo. Khi nấu, cho nấm vào gần cuối, đảo nhẹ và nấu chín hoàn toàn.

## 4. Bảo quản

Cho nấm vào ngăn mát (khoảng 4°C) ngay sau khi mua, giữ nguyên bao bì và không để ướt. Sau khi mở gói, dùng giấy khô hút ẩm và dùng sớm. Bỏ ngay nấm có thân sẫm màu, bị nhớt hoặc mùi chua.

(Tóm tắt từ monngonmoingay.com)', null, true),
    ('Hột vịt lộn bao nhiêu calo? 5 cách chế biến lạ miệng', 'meo-che-bien-hot-vit-lon', 'Một quả hột vịt lộn giàu đạm nhưng cũng nhiều cholesterol, nên ăn điều độ. Xem giá trị dinh dưỡng chi tiết và 5 cách chế biến hấp dẫn.', '## 1. Giá trị dinh dưỡng

Một quả hột vịt lộn khoảng 100g cung cấp 182 kcal, 13,6g protein và 12,4g chất béo, cùng canxi, phốt pho, sắt, vitamin A và nhóm B. Lượng cholesterol khoảng 600 mg mỗi quả — gấp đôi mức tham chiếu 300 mg mỗi ngày — nên cần ăn với lượng vừa phải.

## 2. Năm cách chế biến

- Xào me chua ngọt
- Chiên giòn xốt me
- Um bầu (đặc sản Huế)
- Nướng muối ớt
- Luộc nước dừa chấm muối tiêu

## 3. Mẹo luộc không vỡ

Bắt đầu luộc từ nước lạnh, đổ nước ngập trứng khoảng 2–3cm, chọn nồi đủ rộng. Sau khi nước sôi thì giữ lửa vừa, luộc 15–18 phút tính từ lúc sôi. Dùng ngay khi còn nóng là ngon nhất.

## 4. Ăn đúng cách

Ưu tiên cách chế biến ít dầu như luộc hoặc um bầu. Ăn kèm rau răm và gừng thái sợi, hạn chế nêm gia vị quá mặn. Chọn trứng còn nguyên vỏ, nguồn gốc rõ ràng và không để trứng đã luộc lâu ở nhiệt độ phòng.

(Tóm tắt từ monngonmoingay.com)', null, true),
    ('Cách nấu canh cải xoong thanh ngọt, bổ dưỡng', 'cach-nau-canh-cai-xoong', 'Canh cải xoong ngon khi cải còn xanh, nước ngọt tự nhiên. Học cách chọn cải non, giảm vị hăng và canh đúng thời gian.', '## 1. Giá trị dinh dưỡng

Cải xoong ít calo nhưng giàu vitamin A, C, K, canxi, kali, sắt, chất xơ và chất chống oxy hóa. Loại rau này hỗ trợ sức khỏe xương, tăng đề kháng, tốt cho thị lực, làn da và hệ tiêu hóa.

## 2. Năm cách nấu gợi ý

- Canh cải xoong thịt bằm (cách cơ bản)
- Canh tôm tươi (tận dụng vỏ và đầu tôm nấu nước dùng)
- Canh sườn heo hầm
- Canh đậu hũ non thanh đạm
- Canh thịt bò

## 3. Giảm vị hăng

Cắt bỏ phần gốc già khoảng 3–4cm, ngâm nước muối loãng 5–10 phút rồi tách riêng thân và ngọn. Chọn cải non cọng nhỏ, lá xanh đậm; tránh cải đã ra hoa vàng. Nên mua cải trồng ở nguồn nước sạch.

## 4. Nguyên tắc vàng khi nấu

Chỉ cho cải vào khi nước đang sôi bùng, nấu 1–2 phút rồi tắt bếp ngay. Nấu quá lâu làm cải hăng và mất vị ngọt. Nêm đường rất nhẹ, không nêm mặn quá. Ưu tiên nước dùng xương hoặc nước vỏ tôm để có vị ngọt tự nhiên, cho hành lá vào cuối cùng.

(Tóm tắt từ monngonmoingay.com)', null, true),
    ('7 cách xào mì Ý ngon cho người mới bắt đầu', 'cach-xao-mi-y-ngon', 'Mì Ý xào ngon khi sợi mì dai, bóng mượt và thấm đều sốt. Nắm vững cách luộc mì và bí quyết xào lửa lớn dưới đây.', '## 1. Bảy món gợi ý

Mì Ý xào bò bằm truyền thống, mì Ý xốt kem béo mịn, mì Ý xào rau củ thanh đạm (chay), mì Ý xào bò sốt tiêu đen, mì Ý xào tôm bơ tỏi, mì Ý xào xúc xích phô mai kiểu Âu và mì Ý xào sốt cua.

## 2. Luộc mì dai ngon

Dùng nồi nước lớn để sợi mì có không gian bung nở. Cho khoảng 1 muỗng canh muối vào mỗi lít nước sôi trước khi thả mì. Luộc vừa chín tới, lõi hơi dai. Giữ lại một ít nước luộc mì và không xả mì dưới nước lạnh.

## 3. Bí quyết xào bóng mượt, thấm vị

Xào trên lửa lớn trong 2–3 phút. Thêm 2–3 muỗng canh nước luộc mì vào chảo để sốt bám đều. Nêm gia vị vào sốt trước thay vì rắc trực tiếp lên mì. Xào riêng thịt, tôm hoặc rau củ rồi mới trộn mì vào sau. Dùng kẹp gắp thay muỗng để sợi mì không bị gãy, nhỏ vài giọt dầu mè hoặc dầu ô liu trước khi tắt bếp.

## 4. Lỗi thường gặp

- Mì dính chùm: luộc ít nước, không khuấy 1–2 phút đầu.
- Mì nhão: luộc quá lâu.
- Sợi khô ráp: xào lửa nhỏ quá lâu, thiếu nước luộc mì.
- Gia vị không thấm: nêm muộn hoặc rắc khô trực tiếp.
- Mì gãy nát: đảo quá mạnh bằng muỗng.

(Tóm tắt từ monngonmoingay.com)', null, true)
on conflict (slug) do update set
    title = excluded.title,
    excerpt = excluded.excerpt,
    content = excluded.content,
    image_url = excluded.image_url,
    is_published = excluded.is_published,
    updated_at = now();
