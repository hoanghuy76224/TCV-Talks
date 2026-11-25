/* Original bilingual mini-lessons arranged by domain. Each line is one study pack. */
{
const themes = `
#people|Con người và gia đình
Thành viên gia đình|parent=cha hoặc mẹ;sister=chị hoặc em gái;uncle=chú, bác hoặc cậu
Mối quan hệ|neighbor=hàng xóm;classmate=bạn cùng lớp;relative=họ hàng
Ngoại hình|curly hair=tóc xoăn;freckles=tàn nhang;beard=râu
Tính cách|patient=kiên nhẫn;reliable=đáng tin;cautious=thận trọng
Chăm sóc gia đình|caregiver=người chăm sóc;household=hộ gia đình;childcare=việc trông trẻ
Quan hệ giữa các thế hệ|generation gap=khoảng cách thế hệ;upbringing=cách được nuôi dạy;kinship=quan hệ họ hàng
Gắn kết xã hội|mutual support=hỗ trợ lẫn nhau;estrangement=sự xa cách;interdependence=sự phụ thuộc lẫn nhau
#home|Nhà ở và sinh hoạt
Các phòng|kitchen=nhà bếp;hallway=hành lang;balcony=ban công
Đồ dùng|shelf=kệ;blanket=chăn;curtain=rèm
Việc nhà|sweep=quét;tidy up=dọn gọn;laundry=đồ giặt
Thuê chỗ ở|landlord=chủ nhà cho thuê;deposit=tiền đặt cọc;lease=hợp đồng thuê
Sửa chữa|leak=chỗ rò rỉ;plumber=thợ ống nước;insulation=lớp cách nhiệt
Chi phí nhà ở|utility bill=hóa đơn tiện ích;affordability=khả năng chi trả;housing shortage=thiếu nhà ở
Quy hoạch khu dân cư|occupancy rate=tỷ lệ nhà đang được sử dụng;residential zoning=phân vùng nhà ở;displacement=sự di dời cư dân
#food|Ăn uống
Đồ ăn quen thuộc|bread=bánh mì;rice=cơm hoặc gạo;vegetable=rau củ
Gọi món|menu=thực đơn;starter=món khai vị;side dish=món ăn kèm
Vị món ăn|sour=chua;salty=mặn;crunchy=giòn
Chế biến|boil=luộc hoặc đun sôi;slice=thái lát;roast=nướng bằng nhiệt khô
Chế độ ăn|allergy=dị ứng;portion=khẩu phần;ingredient=nguyên liệu
Dinh dưỡng|nutrient=chất dinh dưỡng;deficiency=sự thiếu hụt;whole grain=ngũ cốc nguyên hạt
Hệ thống thực phẩm|fortification=việc bổ sung vi chất;food insecurity=tình trạng thiếu tiếp cận thực phẩm đủ;perishable=dễ hỏng
#city|Thành phố
Địa điểm công cộng|park=công viên;library=thư viện;market=chợ
Đi bộ trong phố|pavement=vỉa hè;crossing=lối sang đường;corner=góc đường
Khu vực đô thị|suburb=vùng ngoại ô;district=khu vực hành chính;landmark=địa danh dễ nhận biết
Dịch vụ địa phương|waste collection=thu gom rác;permit=giấy phép;public facility=cơ sở công cộng
Tắc nghẽn đô thị|congestion=ùn tắc;pedestrian zone=khu dành cho người đi bộ;commuting time=thời gian đi làm
Phát triển thành phố|urban sprawl=đô thị lan rộng;redevelopment=tái phát triển;housing density=mật độ nhà ở
Thiết kế không gian|walkability=mức thuận tiện để đi bộ;public realm=không gian công cộng;urban renewal=chỉnh trang đô thị
#transport|Giao thông
Phương tiện|bicycle=xe đạp;train=tàu hỏa;motorbike=xe máy
Chuyến đi|fare=giá vé;journey=chuyến đi;route=tuyến đường
Chậm chuyến|delay=sự chậm trễ;departure=chuyến rời đi;cancellation=việc hủy chuyến
An toàn đường bộ|seat belt=dây an toàn;speed limit=giới hạn tốc độ;blind spot=điểm mù
Kết nối tuyến|transfer=chuyển tuyến;interchange=điểm trung chuyển;frequency=tần suất chạy
Chi phí giao thông|toll=phí qua đường;subsidised fare=giá vé được trợ cấp;operating cost=chi phí vận hành
Giao thông trong quy hoạch|modal shift=chuyển đổi phương thức di chuyển;induced demand=nhu cầu phát sinh do tăng cung;transit-oriented development=phát triển quanh giao thông công cộng
#travel|Du lịch
Chuẩn bị đi xa|passport=hộ chiếu;suitcase=va li;map=bản đồ
Ở khách sạn|check in=nhận phòng;single room=phòng một người;key card=thẻ khóa
Tại sân bay|boarding pass=thẻ lên máy bay;gate=cửa ra máy bay;carry-on=hành lý xách tay
Lên lịch chuyến đi|itinerary=lịch trình;guided tour=chuyến tham quan có hướng dẫn;travel insurance=bảo hiểm du lịch
Sự cố khi du lịch|lost property=đồ thất lạc;refund=tiền hoàn lại;compensation=khoản bồi thường
Tác động cộng đồng|heritage site=địa điểm di sản;seasonal employment=việc làm theo mùa;overtourism=quá tải du lịch
Quản lý điểm đến|visitor levy=phí áp lên khách;carrying capacity=sức tải của điểm đến;destination stewardship=quản lý có trách nhiệm điểm đến
#shopping|Mua sắm
Ở cửa hàng|shop=cửa hàng;cashier=thu ngân;price=giá
Chọn hàng|size=kích cỡ;try on=mặc thử;in stock=còn hàng
Đặt hàng|order=đơn đặt hàng;delivery date=ngày giao;tracking number=mã theo dõi
Đổi trả sản phẩm|exchange=đổi sản phẩm;return policy=chính sách trả hàng;faulty=bị lỗi
So sánh chất lượng|durability=độ bền;warranty=bảo hành;value for money=đáng tiền
Hành vi tiêu dùng|impulse purchase=mua bốc đồng;brand loyalty=sự trung thành với thương hiệu;planned obsolescence=chủ đích làm sản phẩm nhanh lỗi thời
Quyền của người mua|misleading claim=tuyên bố gây hiểu lầm;statutory protection=bảo hộ theo luật định;consumer redress=cơ chế yêu cầu khắc phục
#money|Tài chính cá nhân
Tiền hằng ngày|coins=tiền xu;wallet=ví;change=tiền thối
Tài khoản ngân hàng|bank account=tài khoản ngân hàng;withdraw=rút tiền;transfer fee=phí chuyển tiền
Kế hoạch chi tiêu|expense=khoản chi;savings=tiền tiết kiệm;income=thu nhập
Vay tiền|loan=khoản vay;interest rate=lãi suất;repayment=khoản trả nợ
Dự phòng ngân sách|emergency fund=quỹ khẩn cấp;fixed cost=chi phí cố định;cash flow=dòng tiền
Tài chính dài hạn|inflation=lạm phát;diversification=đa dạng hóa;retirement savings=tiết kiệm hưu trí
Đánh đổi tài chính|liquidity=tính thanh khoản;opportunity cost=chi phí cơ hội;compounding=lãi cộng dồn
#education|Giáo dục
Trong lớp|teacher=giáo viên;notebook=vở;lesson=bài học
Học ở nhà|homework=bài tập về nhà;revise=ôn lại;practice=luyện tập
Trường và khóa học|enrol=ghi danh;timetable=thời khóa biểu;assignment=bài tập được giao
Kết quả học|feedback=phản hồi;grade=điểm đánh giá;learning outcome=kết quả học tập
Kỹ năng học|active recall=chủ động nhớ lại;self-assessment=tự đánh giá;study habit=thói quen học
Thiết kế giáo dục|curriculum=chương trình học;formative assessment=đánh giá trong quá trình;scaffolding=hỗ trợ từng bước
Chính sách học tập|equity in education=công bằng giáo dục;attainment gap=khoảng cách thành tích;credential inflation=lạm phát bằng cấp
#language|Ngôn ngữ và giao tiếp
Câu nói hằng ngày|hello=xin chào;repeat=lặp lại;meaning=ý nghĩa
Học từ|flashcard=thẻ từ;definition=định nghĩa;example=ví dụ
Nói rõ hơn|clarify=làm rõ;spell=đánh vần;paraphrase=diễn đạt lại
Văn phong|formal=trang trọng;informal=thân mật;polite=lịch sự
Nói trước nhóm|audience=khán giả;emphasis=điểm nhấn;intonation=ngữ điệu
Sắc thái giao tiếp|register=ngữ vực;ambiguity=tính mơ hồ;pragmatic meaning=nghĩa hàm dụng
Phân tích diễn ngôn|implicature=hàm ý suy ra;code-switching=chuyển mã ngôn ngữ;discursive framing=định khung bằng diễn ngôn
#work|Việc làm
Đồ dùng nơi làm việc|printer=máy in;keyboard=bàn phím;folder=bìa đựng tài liệu
Giờ và ca làm|shift=ca làm;day off=ngày nghỉ;overtime=giờ làm thêm
Tìm việc|vacancy=vị trí trống;application=đơn ứng tuyển;interview=phỏng vấn
Vào công việc mới|orientation=buổi làm quen;probation=thời gian thử việc;supervisor=người giám sát
Phát triển nghề nghiệp|promotion=thăng chức;skills gap=khoảng thiếu kỹ năng;mentorship=sự hướng dẫn nghề nghiệp
Thay đổi thị trường việc làm|redundancy=cắt vị trí do không còn nhu cầu;reskilling=đào tạo kỹ năng mới;labour mobility=tính dịch chuyển lao động
Quan hệ lao động|collective bargaining=thương lượng tập thể;workplace grievance=khiếu nại tại nơi làm việc;labour market segmentation=phân khúc thị trường lao động
#meetings|Họp hành
Vào cuộc họp|meeting=cuộc họp;chair=ghế;join=tham gia
Hẹn lịch họp|invite=mời;meeting room=phòng họp;agenda=chương trình họp
Trong buổi họp|attendee=người tham dự;take notes=ghi chú;raise a point=nêu một ý
Chốt kết quả|action item=việc cần thực hiện;minutes=biên bản;vote=biểu quyết
Điều phối thảo luận|facilitate=điều phối;timebox=giới hạn thời gian;table a proposal=đưa đề xuất ra bàn (Anh–Anh)
Ra quyết định nhóm|consensus=đồng thuận;abstain=không bỏ phiếu thuận hay chống;quorum=số người tối thiểu để họp hợp lệ
Điều hành đối thoại khó|procedural fairness=công bằng về quy trình;dissenting view=ý kiến bất đồng;conflict of interest=xung đột lợi ích
#projects|Quản lý dự án
Bắt đầu việc|task=nhiệm vụ;team=nhóm;list=danh sách
Chia việc|assign=giao việc;owner=người chịu trách nhiệm;due date=ngày đến hạn
Báo tiến độ|status update=cập nhật tình trạng;blocker=trở ngại;checkpoint=mốc kiểm tra
Lập kế hoạch|scope=phạm vi;estimate=ước tính;dependency=việc phụ thuộc
Theo dõi thay đổi|change request=yêu cầu thay đổi;acceptance criteria=tiêu chí nghiệm thu;backlog=danh sách việc tồn
Đánh giá dự án|postmortem=đánh giá sau sự cố;root cause=nguyên nhân gốc;corrective action=biện pháp khắc phục
Điều hành chương trình|governance=cơ chế quản trị;portfolio alignment=phối hợp danh mục với chiến lược;critical path=chuỗi việc quyết định thời hạn
#email|Email công việc
Các phần email|subject=tiêu đề;reply=trả lời;send=gửi
Gửi tệp|attach=đính kèm;download=tải xuống;forward=chuyển tiếp
Nhờ phản hồi|reminder=lời nhắc;response=phản hồi;by noon=trước hoặc vào trưa
Giọng điệu thư|concise=súc tích;courteous=lịch thiệp;direct=thẳng thắn
Trao đổi chính thức|reference number=mã tham chiếu;recipient=người nhận;acknowledgement=lời xác nhận
Giải quyết hiểu lầm|clarification=sự làm rõ;retraction=việc rút lại;miscommunication=sự truyền đạt sai
Soạn thông báo có hệ quả|disclaimer=tuyên bố giới hạn trách nhiệm;formal notice=thông báo chính thức;record of correspondence=hồ sơ thư từ
#clients|Quan hệ khách hàng
Nhu cầu của khách|customer=khách hàng;help=giúp đỡ;problem=vấn đề
Tiếp nhận yêu cầu|request=yêu cầu;contact=liên hệ;help desk=bộ phận hỗ trợ
Xác minh thông tin|account holder=chủ tài khoản;order number=mã đơn hàng;proof of purchase=bằng chứng mua hàng
Khắc phục sự cố|replacement=sản phẩm thay thế;refund policy=chính sách hoàn lại;response time=thời gian phản hồi
Đánh giá dịch vụ|satisfaction=sự hài lòng;retention=khả năng giữ khách;feedback loop=vòng lặp phản hồi
Cam kết hỗ trợ|service-level agreement=thỏa thuận mức dịch vụ;recurring issue=sự cố lặp lại;customer churn=tỷ lệ khách rời bỏ
Thương lượng phương án|goodwill gesture=thiện chí bù đắp;proportionate remedy=biện pháp khắc phục tương xứng;settlement=thỏa thuận giải quyết
#logistics|Vận chuyển và kho
Đóng gói|box=hộp;label=nhãn;parcel=bưu kiện
Gửi hàng|address=địa chỉ;courier=đơn vị giao hàng;deliver=giao
Kiểm kê kho|inventory=hàng tồn;warehouse=kho;stock count=đợt đếm hàng
Chứng từ vận chuyển|waybill=vận đơn;packing list=phiếu đóng gói;consignment=lô hàng gửi
Xử lý chậm giao|backorder=đơn chờ bổ sung hàng;lead time=thời gian từ đặt đến nhận;reroute=đổi tuyến
Quản lý cung ứng|safety stock=tồn kho an toàn;supplier diversification=đa dạng nhà cung cấp;bottleneck=nút thắt
Hiệu suất chuỗi cung ứng|bullwhip effect=hiệu ứng khuếch đại biến động nhu cầu;fulfilment accuracy=độ chính xác hoàn tất đơn;last-mile optimisation=tối ưu chặng giao cuối
#technology|Thiết bị và công nghệ
Thiết bị|phone=điện thoại;screen=màn hình;charger=bộ sạc
Tệp tin cơ bản|file=tệp;click=nhấp;save=lưu
Sự cố thiết bị|restart=khởi động lại;freeze=treo máy;connection=kết nối
Cấu hình|setting=cài đặt;update=bản cập nhật;compatible=tương thích
Làm việc với phần mềm|dashboard=bảng điều khiển;shortcut=phím tắt;interface=giao diện
Độ tin cậy hệ thống|outage=thời gian ngừng hệ thống;redundancy=dự phòng trùng lặp;latency=độ trễ
Chuyển đổi công nghệ|interoperability=khả năng liên thông;legacy system=hệ thống cũ;technical debt=nợ kỹ thuật
#security|Quyền riêng tư và an toàn số
Giữ an toàn|password=mật khẩu;close=đóng;lock=khóa
Tài khoản|sign in=đăng nhập;sign out=đăng xuất;access=quyền vào
Nhận diện rủi ro|spam=thư rác;phishing=lừa lấy thông tin;unsafe link=đường dẫn không an toàn
Bảo vệ dữ liệu|encryption=mã hóa;two-factor authentication=xác thực hai lớp;security patch=bản vá bảo mật
Xử lý sự cố|data breach=rò rỉ dữ liệu;incident response=ứng phó sự cố;credential=thông tin xác thực
Quản trị dữ liệu|retention policy=chính sách lưu giữ;access control=kiểm soát truy cập;data minimisation=tối thiểu hóa dữ liệu
Đánh giá rủi ro riêng tư|purpose limitation=giới hạn theo mục đích;re-identification=tái nhận dạng;privacy by design=tích hợp riêng tư từ thiết kế
#health|Sức khỏe
Cơ thể và triệu chứng|headache=đau đầu;cough=ho;fever=sốt
Đặt lịch khám|doctor=bác sĩ;clinic=phòng khám;appointment slot=khung giờ khám
Ở nhà thuốc|prescription=đơn thuốc;dose=liều dùng;side effect=tác dụng phụ
Thói quen sức khỏe|hydration=việc bổ sung đủ nước;balanced diet=chế độ ăn cân bằng;regular exercise=tập luyện đều đặn
An toàn lao động|hazard=mối nguy;protective equipment=thiết bị bảo hộ;first aid=sơ cứu
Sức khỏe cộng đồng|preventive care=chăm sóc dự phòng;screening=sàng lọc;health literacy=khả năng hiểu thông tin sức khỏe
Hệ thống y tế|continuity of care=tính liên tục trong chăm sóc;health disparity=chênh lệch sức khỏe;cost-effectiveness=hiệu quả xét theo chi phí
#sport|Thể thao
Môn vận động|running=chạy bộ;swimming=bơi;lifting=nâng tạ
Chỗ tập|pool=hồ bơi;gym=phòng tập;court=sân có vạch
Buổi tập|warm-up=khởi động;stretch=giãn cơ;cool-down=hạ nhiệt sau tập
Thi đấu|referee=trọng tài;fixture=lịch trận;league=giải đấu theo mùa
Kỹ thuật tập|endurance=sức bền;recovery=phục hồi;form=tư thế kỹ thuật
Tham gia phong trào|inclusive sport=thể thao hòa nhập;community league=giải cộng đồng;participation rate=tỷ lệ tham gia
Đạo đức thi đấu|sportsmanship=tinh thần thể thao;fair play=thi đấu công bằng;eligibility criteria=tiêu chí đủ điều kiện
#environment|Môi trường
Cảnh quan|river=sông;forest=rừng;lake=hồ
Thời tiết|rain=mưa;wind=gió;storm=bão hoặc giông
Giữ môi trường sạch|recycle=tái chế;litter=xả rác;bin=thùng rác
Khí hậu biến đổi|heatwave=đợt nắng nóng;drought=hạn hán;flooding=ngập lụt
Đa dạng sinh học|habitat=sinh cảnh;species=loài;ecosystem=hệ sinh thái
Quản lý môi trường|restoration=phục hồi;conservation=bảo tồn;environmental impact=tác động môi trường
Rủi ro sinh thái|threshold effect=hiệu ứng khi vượt ngưỡng;ecological resilience=khả năng phục hồi sinh thái;cumulative impact=tác động tích lũy
#resources|Năng lượng và nước
Sử dụng điện|light bulb=bóng đèn;switch=công tắc;socket=ổ cắm
Sử dụng nước|tap=vòi nước;pipe=ống dẫn;bucket=xô
Đo mức sử dụng|meter=công tơ;usage=mức sử dụng;consumption=tiêu thụ
Nguồn năng lượng|solar panel=tấm pin mặt trời;wind turbine=tuabin gió;fossil fuel=nhiên liệu hóa thạch
Hiệu suất|standby power=điện tiêu thụ ở chế độ chờ;heat loss=thất thoát nhiệt;excess demand=nhu cầu vượt khả năng cung ứng
Quản lý tài nguyên|water scarcity=khan hiếm nước;renewable supply=nguồn cung tái tạo;grid stability=ổn định lưới điện
Chuyển dịch năng lượng|decarbonisation=khử carbon;demand-side management=quản lý phía cầu;stranded asset=tài sản mất giá do chuyển đổi
#research|Khoa học và nghiên cứu
Trong phòng thí nghiệm|test=phép thử;sample=mẫu;tool=dụng cụ
Ghi nhận quan sát|measure=đo;record=ghi lại;result=kết quả
Tổ chức thử nghiệm|trial=lần thử;condition=điều kiện;comparison=đối chiếu
Thiết kế nghiên cứu|hypothesis=giả thuyết;control group=nhóm đối chứng;variable=biến
Đọc kết quả|margin of error=biên sai số;sample size=cỡ mẫu;significance=ý nghĩa thống kê
Chất lượng bằng chứng|peer review=phản biện đồng cấp;confounding factor=yếu tố gây nhiễu;reproducibility=khả năng tái tạo kết quả
Suy luận nghiên cứu|causal inference=suy luận nhân quả;external validity=giá trị suy rộng;publication bias=sai lệch công bố
#media|Truyền thông
Các kênh|radio=đài phát thanh;newspaper=báo in;television=truyền hình
Đọc tin|headline=tiêu đề tin;article=bài báo;interviewee=người được phỏng vấn
Tạo nội dung|caption=chú thích;edit=biên tập;publish=đăng
Đánh giá nguồn|source=nguồn;rumour=tin đồn;fact-check=kiểm chứng thông tin
Phân phối nội dung|subscriber=người theo dõi có đăng ký;engagement=mức tương tác;reach=lượng người tiếp cận
Ảnh hưởng truyền thông|framing=cách định khung;selective exposure=chỉ tiếp xúc chọn lọc;echo chamber=buồng vang ý kiến
Chuẩn mực biên tập|editorial independence=độc lập biên tập;public-interest reporting=đưa tin vì lợi ích công chúng;right of reply=quyền phản hồi
#marketing|Tiếp thị
Giới thiệu sản phẩm|product=sản phẩm;poster=áp phích;price tag=nhãn giá
Khuyến mãi|offer=ưu đãi;coupon=phiếu giảm giá;sale=đợt giảm giá
Tìm hiểu khách hàng|survey=khảo sát;target audience=đối tượng mục tiêu;market segment=phân khúc thị trường
Nội dung quảng cáo|slogan=khẩu hiệu;campaign=chiến dịch;testimonial=lời chứng thực
Hiệu quả chiến dịch|conversion rate=tỷ lệ chuyển đổi;click-through rate=tỷ lệ nhấp;cost per lead=chi phí mỗi khách tiềm năng
Định vị sản phẩm|brand positioning=định vị thương hiệu;value proposition=giá trị đề xuất;customer journey=hành trình khách hàng
Đánh giá tác động|incrementality=mức tác động tăng thêm;attribution bias=sai lệch quy kết;brand equity=giá trị thương hiệu
#culture|Văn hóa và nghệ thuật
Đi xem biểu diễn|theatre=nhà hát;ticket booth=quầy vé;stage=sân khấu
Tác phẩm|painting=tranh;poem=bài thơ;sculpture=tác phẩm điêu khắc
Lễ hội|costume=trang phục biểu diễn;parade=diễu hành;tradition=truyền thống
Tham quan bảo tàng|exhibition=triển lãm;gallery=phòng trưng bày;artefact=hiện vật
Bảo tồn|archive=kho lưu trữ;restoration work=công việc phục chế;oral history=lịch sử truyền miệng
Sản xuất nghệ thuật|commission=đặt làm tác phẩm;curator=giám tuyển;patronage=bảo trợ nghệ thuật
Di sản và quản trị|intangible heritage=di sản phi vật thể;provenance=nguồn gốc sở hữu;repatriation=trả lại về nơi xuất xứ
#community|Cộng đồng
Tham gia khu phố|neighbor group=nhóm hàng xóm;meeting place=điểm gặp;noticeboard=bảng thông báo
Giúp đỡ|volunteer=tình nguyện viên;donate=quyên góp;charity=tổ chức từ thiện
Tổ chức sự kiện|venue=địa điểm;signup=đăng ký tham gia;sponsor=nhà tài trợ
Đại diện cộng đồng|resident=cư dân;committee=ủy ban;local council=hội đồng địa phương
Thảo luận công khai|consultation=tham vấn;petition=đơn kiến nghị;common ground=điểm chung
Hòa nhập xã hội|social inclusion=hòa nhập xã hội;underrepresentation=thiếu đại diện;accessibility=khả năng tiếp cận
Phát triển cộng đồng|capacity building=nâng cao năng lực;participatory governance=quản trị có sự tham gia;social capital=vốn xã hội
#policy|Quy định và chính sách
Hướng dẫn hằng ngày|rule=quy tắc;notice=thông báo;sign=biển báo
Nộp giấy tờ|form=mẫu đơn;signature=chữ ký;identity card=giấy tờ tùy thân
Quy định địa phương|regulation=quy định;inspection=kiểm tra;renewal=gia hạn
Quy trình quyết định|proposal=đề xuất;approval=phê duyệt;appeal=kháng nghị hoặc khiếu nại
Theo dõi chính sách|implementation=triển khai;compliance=tuân thủ;benchmark=mốc so sánh
Đánh giá tác động|stakeholder=bên liên quan;unintended consequence=hệ quả ngoài dự kiến;policy evaluation=đánh giá chính sách
Phân tích quy định|proportionality=tính tương xứng;regulatory capture=chi phối cơ quan quản lý;statutory discretion=quyền tùy nghi theo luật
#justice|Công lý và quyền lợi
An toàn công cộng|police=cảnh sát;emergency=khẩn cấp;report=báo cáo
Ghi nhận sự việc|witness=nhân chứng;statement=lời trình bày;proof=bằng chứng
Giải quyết tranh chấp|dispute=tranh chấp;agreement=thỏa thuận;mediator=người hòa giải
Trong thủ tục pháp lý|hearing=phiên điều trần;legal aid=trợ giúp pháp lý;judgment=phán quyết
Quyền và nghĩa vụ|obligation=nghĩa vụ;entitlement=quyền được hưởng;liability=trách nhiệm pháp lý
Xem xét bằng chứng|burden of proof=gánh nặng chứng minh;testimony=lời khai;admissibility=tính được chấp nhận làm bằng chứng
Nguyên tắc tố tụng|due process=quy trình tố tụng công bằng;presumption of innocence=suy đoán vô tội;judicial review=xem xét tư pháp
#trade|Kinh tế và thương mại
Mua và bán|buy=mua;sell=bán;cost=chi phí
Chi phí doanh nghiệp|profit=lợi nhuận;loss=thua lỗ;rent=tiền thuê
Hàng hóa và dịch vụ|import=nhập khẩu;export=xuất khẩu;retailer=nhà bán lẻ
Giá và nhu cầu|supply=nguồn cung;demand=nhu cầu;shortage=sự thiếu hụt
Thương mại quốc tế|tariff=thuế quan;quota=hạn ngạch;customs duty=thuế hải quan
Đánh giá thị trường|market concentration=mức tập trung thị trường;entry barrier=rào cản gia nhập;price elasticity=độ co giãn theo giá
Kinh tế vĩ mô|current account=tài khoản vãng lai;terms of trade=tỷ lệ trao đổi thương mại;countercyclical policy=chính sách ngược chu kỳ
# agriculture|Thực phẩm và nông nghiệp
Ở nông trại|farm=nông trại;field=cánh đồng;seed=hạt giống
Thu hoạch|crop=cây trồng hoặc vụ mùa;harvest=thu hoạch;grain=hạt ngũ cốc
Tưới và trồng|irrigation=tưới tiêu;seedling=cây con;greenhouse=nhà kính
Bảo quản|storage facility=kho bảo quản;cold chain=chuỗi lạnh;shelf life=hạn bảo quản
Quản lý sâu bệnh|pest=côn trùng gây hại;pesticide=thuốc trừ sâu;crop rotation=luân canh
Sản xuất bền vững|soil erosion=xói mòn đất;resource efficiency=hiệu quả sử dụng tài nguyên;regenerative farming=nông nghiệp tái tạo
An ninh lương thực|yield variability=biến động năng suất;supply resilience=khả năng chống gián đoạn nguồn cung;agricultural extension=khuyến nông
#mobility|Di cư và hòa nhập
Di chuyển chỗ ở|move house=chuyển nhà;country=quốc gia;hometown=quê nhà
Giấy tờ đi lại|visa=thị thực;entry=nhập cảnh;border=biên giới
Ổn định nơi ở mới|settle in=ổn định ở nơi mới;local services=dịch vụ địa phương;residence permit=giấy phép cư trú
Hỗ trợ hòa nhập|language support=hỗ trợ ngôn ngữ;recognition of qualifications=công nhận bằng cấp;integration=hòa nhập
Nguyên nhân di chuyển|job prospects=triển vọng việc làm;family reunification=đoàn tụ gia đình;displacement from conflict=di dời do xung đột
Tác động dân số|population ageing=già hóa dân số;net migration=di cư ròng;demographic change=biến động nhân khẩu
Chính sách hòa nhập|portability of benefits=khả năng chuyển quyền lợi;institutional barriers=rào cản thể chế;transnational ties=mối liên kết xuyên quốc gia
#oceans|Biển và nguồn nước
Ven biển|beach=bãi biển;wave=sóng;shore=bờ
Đi biển|boat=thuyền;harbour=bến cảng;tide=thủy triều
Sinh vật biển|fish=cá;coral=san hô;seabird=chim biển
Rủi ro ven bờ|coastal erosion=xói mòn bờ biển;storm surge=nước dâng do bão;oil spill=tràn dầu
Quản lý nguồn nước|watershed=lưu vực;water treatment=xử lý nước;water quality=chất lượng nước
Sức khỏe đại dương|ocean acidification=axit hóa đại dương;overfishing=đánh bắt quá mức;marine reserve=khu bảo tồn biển
Chính sách vùng biển|integrated coastal management=quản lý tổng hợp vùng bờ;quota allocation=phân bổ hạn ngạch;marine spatial planning=quy hoạch không gian biển
#time|Quản lý thời gian
Buổi trong ngày|morning=buổi sáng;afternoon=buổi chiều;evening=buổi tối
Sắp xếp lịch|calendar=lịch;early=sớm;late=muộn
Thứ tự công việc|priority=mức ưu tiên;sequence=trình tự;start date=ngày bắt đầu
Phân bổ thời gian|block out=để dành một khung giờ;time estimate=ước lượng thời gian;buffer time=thời gian đệm
Giảm gián đoạn|interruption=sự gián đoạn;notification=thông báo bật lên;batch similar tasks=gom các việc tương tự
Theo dõi thói quen|time audit=kiểm lại cách dùng thời gian;context switching=chuyển ngữ cảnh công việc;procrastination=sự trì hoãn
Tối ưu kế hoạch|slack time=khoảng dự trữ thời gian;capacity planning=lập kế hoạch theo năng lực;diminishing returns=hiệu quả tăng thêm giảm dần
`;

let slug="", topic="", series=0;
const levels=["A1","A2","B1","B2","C1","C1","C2"];
for(const line of themes.trim().split("\n")){
  if(line.startsWith("#")){
    [slug,topic]=line.slice(1).split("|");
    slug=slug.trim();
    series=0;
    continue;
  }
  const [title,entries]=line.split("|");
  const cards=entries.split(";").map(entry=>entry.split("="));
  window.DINO_STUDY_CONTENT.vocabulary.push({
    id:`vocabulary-${slug}-${series+1}`,level:levels[series++],topicId:slug,topic,title,
    details:`Chủ đề ${topic.toLocaleLowerCase("vi")}.`,cards
  });
}
}
