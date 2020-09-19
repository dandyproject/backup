exports.textTnC = () => {
    return `
Source code / bot ini merupakan program open-source (gratis) yang ditulis menggunakan Javascript, kamu dapat menggunakan, menyalin, memodifikasi, menggabungkan, menerbitkan, mendistribusikan, mensublisensikan, dan atau menjual salinan dengan tanpa menghapus author utama dari source code / bot ini.

Dengan menggunakan source code / bot ini maka anda setuju dengan Syarat dan Kondisi sebagai berikut:
- Source code / bot tidak menyimpan data anda di server kami.
- Source code / bot tidak bertanggung jawab atas sticker yang anda buat dari bot ini serta video, gambar maupun data lainnya yang anda dapatkan dari Source code / bot ini.
- Source code / bot tidak boleh digunakan untuk layanan yang bertujuan/berkontribusi dalam: 
    • seks / perdagangan manusia
    • perjudian
    • perilaku adiktif yang merugikan 
    • kejahatan
    • kekerasan (kecuali jika diperlukan untuk melindungi keselamatan publik)
    • pembakaran hutan / penggundulan hutan
    • ujaran kebencian atau diskriminasi berdasarkan usia, jenis kelamin, identitas gender, ras, seksualitas, agama, kebangsaan

Source Code BOT : https://github.com/YogaSakti/imageToSticker
NodeJS WhatsApp library: https://github.com/open-wa/wa-automate-nodejs

Best regards, Special Thanks to Yoga Sakti.

Owner Bot: wa.me/6289636035164
Follow My Instagram:  https://instagram.com/dandisubhani_`
}

exports.textMenu = (pushname) => {
    return `
Hi, *${pushname}* !
Berikut adalah beberapa fitur yang ada pada bot ini!✨

Sticker Creator:
1. *!P*
Untuk merubah gambar menjadi sticker. 
Penggunaan: kirim gambar dengan caption !P atau balas gambar yang sudah dikirim dengan !P

2. *!P* _<Url Gambar>_
Untuk merubah gambar dari url menjadi sticker. 
Penggunaan: 

3. *!gifsticker* _<Giphy URL>_ 
Untuk merubah gif menjadi sticker (Giphy Only)
Penggunaan: Kirim pesan dengan format *!gifsticker https://media.giphy.com/media/JUvI2c1ddyzkwK4RlV/giphy.gif*

Downloader:
1. *!tiktok* _<tiktok url> _
Untuk mengunduh video dari video tiktok.
Penggunaan: kirim pesan dengan format *!tiktok https://www.tiktok.com/@itsandani/video/6869248690381425922* 

2. *!fb* _<post/video url>_
Untuk mengunduh video dari Facebook.
Penggunaan: kirim pesan dengan format *!fb https://www.facebook.com/.....*


Lain-lain:
1. *translate* _<kode bahasa>_
Untuk mengartikan pesan menjadi bahasa yang ditentukan.
Penggunaan: Balas/quote/reply pesan yang ingin kamu translate dengan _*!translate id*_ <- id adalah kode bahasa. kode bahasa dapat dilihat di *!codebahasa*

2. *!resi* _<kurir>_ _<nomer resi>_
Untuk memeriksa status pengiriman barang, daftar kurir: jne, pos, tiki, wahana, jnt, rpx, sap, sicepat, pcp, jet, dse, first, ninja, lion, idl, rex.
Penggunaan: kirim pesan dengan format _*!resi jne 1238757632*_

3. *!meme* _teks atas_ | _teks bawah_
Untuk membuat meme dengan teks atas dan bawah
Penggunaan: kirim gambar dengan caption _*!meme lah | ngatur*_, atau juga bisa dengan membalas gambar yang sudah ada.

4. *!ceklok*
Cek lokasi penyebaran covid-19 di daerah sekitarmu (kelurahan).
Penggunaan: kirimkan lokasimu lalu balas/quote/reply lokasi yang kamu kirim dengan _*!ceklok*_

5. *!tnc*
Menampilkan Syarat dan Kondisi Bot.

6. *!botstat*
menampilkan Jumlah Pesan bot.

7. *!tts* _id,en,ar,jp_ _text_
mengubah teks ke suara (No Spam)

8. *!quotes*
menampilkan quotes.

9. *!anjing*
menampilkan gambar anjing:v.

10. *!kucing*
menampilkan gambar kucing random.

11. *!pokemon*
menampilkan pokemon random.

12. *!wallpaper*
wallpaper random.

13. *!lirik* judul lagu
menampilkan lirik lagu.

Hope you have a great day!✨`
}

exports.textAdmin = () => {
    return `
⚠ [ *Admin Group Only* ] ⚠ 
Berikut adalah beberapa fitur admin grup yang ada pada bot ini!

1. *!add* 628xxxx
Untuk menambah member grup.

2. *!kick* @user
Untuk mengeluarkan member dari grup (bisa lebih dari 1).

3. *!promote* @user
Untuk mempromosikan member menjadi Admin grup.

4. *!demote* @user
Untuk demosikan Admin grup.

5. *!absen*
Untuk mention semua member grup.

6. *!del*
Untuk menghapus pesan bot (balas pesan bot dengan !del)`
}

exports.textDonasi = () => {
    return `
Hai, terimakasih telah menggunakan bot ini, untuk mendukung bot ini kamu dapat membantu dengan berdonasi melalui link berikut:
1. Saweria: https://saweria.co/yogasakti
2. Trakteer: https://trakteer.id/red-emperor 

Donasi akan digunakan untuk pengembangan dan pengoperasian bot ini.

Terimakasih.`
}

exports.textOwner = () => {
    return `
Menu OWner Bot

1. *!addban* @tagmember
Untuk ban member yang gajelas.

2. *!dellban* @tagmember yang keban
Untuk dellban member yang udah tobat.`
}
