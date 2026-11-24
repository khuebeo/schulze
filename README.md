# Tính kết quả bầu chọn xếp hạng (RCV)

Trang web tĩnh tính kết quả Ranked Choice Voting theo phương pháp Schulze. Chạy hoàn toàn trên trình duyệt, không cần máy chủ, dùng được trên GitHub Pages. Giao diện có tiếng Việt, Anh, Nhật và Trung (bản dịch nằm trong `i18n.js`).

## Định dạng phiếu

```
An > Bình > Chi
Japan: Bình > An
Chi, An
An > Bình = Chi
```

Mỗi dòng là đúng một phiếu. Phần trước dấu `:` ở đầu dòng (ví dụ `Japan:`) là tên người bầu, không bắt buộc và không ảnh hưởng kết quả. Dòng bắt đầu bằng `#` là chú thích. Dấu `=` nghĩa là ngang hạng.

## Đăng lên GitHub Pages

1. Đẩy các tệp này lên một repo GitHub.
2. Vào **Settings → Pages**, chọn nhánh `main`, thư mục `/ (root)`.
3. Trang sẽ có ở `https://<tên-tài-khoản>.github.io/<tên-repo>/`, hoặc `https://<tên-tài-khoản>.github.io/` nếu repo tên là `<tên-tài-khoản>.github.io`.

## Kiểm thử

```
node test.js
```
