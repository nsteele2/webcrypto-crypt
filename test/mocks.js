var data = require('./data.js'),
    fs = require('fs'),
    imageClear = data.binary.encodings.plaintext.b64,
    imageCipher = data.binary.encodings.ciphertext.b64,
    imageFile = data.binary.plaintext,
    toBuffer = require('blob-to-buffer'),
    Transcoder = require('../lib/transcoder.js'),
    transcoder = new Transcoder();

module.exports = function () {

    var mocks = {
        pngHash: '5795ae575f2a04c03ffd659dbe665cfad694f15f537b9f8b3673b3003a36da5d',
        pngCipherHash: '5041b67bf2aca626627a505943dc1dacc1ed278f659afe759de069b4fac0e346',
    };

    try {
        mocks.png = fs.readFileSync(imageFile);
        mocks.pngHash = '5795ae575f2a04c03ffd659dbe665cfad694f15f537b9f8b3673b3003a36da5d';
        mocks.pngCipher = Buffer.from(imageCipher, 'base64');
        mocks.pngCipherHash = '5041b67bf2aca626627a505943dc1dacc1ed278f659afe759de069b4fac0e346';
    }
    catch (err) {
        try {
            var xyz = Buffer.from('');  // hack
            mocks.png = new Blob([transcoder.b642uint8(imageClear)], {type: 'image/png'});
            toBuffer(mocks.png, function (err, buffer) {
                if (err) throw err
                mocks.png = buffer;
                mocks.pngCipher = Buffer.from(imageCipher, 'base64');
            });
        }
        catch (err) {
            console.error('XERROR: ' + err);
        }
    }

    mocks.data = data;
    mocks.algorithm = 'AES-GCM';
    mocks.iv = transcoder.str2ab('123456789012');
    mocks.keyLength = 128;
    mocks.tagLength = 128;
    mocks.salt = transcoder.str2ab('1234567890123456');
    mocks.passphrase = 'testSecret';

    return mocks;
};
