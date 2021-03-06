const Config = require('../lib/config.json'),
    expect = require('expect'),
    mocks = new (require('./mocks.js'))(),
    Package = require('../package.json'),
    transcoder = new (require('../lib/transcoder.js'))(),
    Wcrypt = require('../index.js');

const data = mocks.data,
    fixedCipher = data.fixed.encodings.ciphertext,
    fixedPlain = data.fixed.plaintext,
    testOptions = {material: {
        iv: mocks.iv,
        passphrase: mocks.passphrase,
        salt: mocks.salt
    }},
    variableCipher = data.variable.encodings.ciphertext,
    variablePlain = data.variable.plaintext;

describe("Encrypt", function() {

    it("Fails with no data", (done) => {
        var wcrypt = new Wcrypt.cipher(testOptions);
        wcrypt.rawEncrypt()
        .catch((err) => {
            done();
        });
    });

    describe("Fixed length UTF-8 string", () => {

        it("Fails with no passphrase", (done) => {
            var options = {material: {
                iv: mocks.iv,
                salt: mocks.salt
            }},
            wcrypt = new Wcrypt.cipher(options);
            wcrypt.rawEncrypt(fixedPlain)
            .catch((err) => {
                if (err.match(new RegExp(Config.err.passphrase))) {
                    done();
                }
                else {
                    done(err);
                }
            });
        });

        it("Accepts buffer", (done) => {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(fixedPlain)
                .then((buf) => {
                    expect(buf).toExist();
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it("Returns buffer", (done) => {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(fixedPlain)
                .then((buf) => {
                    expect(Buffer.isBuffer(buf)).toBeTruthy();
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it("Returns expected buffer", (done) => {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(fixedPlain)
                .then((buf) => {
                    expect(buf).toEqual(Buffer.from(fixedCipher.hex, 'hex'));
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    describe("Variable length UTF-8 string", function() {

        it("Fails with no passphrase", function(done) {
            var options = {material: {
                iv: mocks.iv,
                salt: mocks.salt
            }},
            wcrypt = new Wcrypt.cipher(options);
            wcrypt.rawEncrypt(variablePlain)
            .catch((err) => {
                if (err.match(new RegExp(Config.err.passphrase))) {
                    done();
                }
                else {
                    done(err);
                }
            });
        });

        it("Accepts buffer", function(done) {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(variablePlain)
                .then((buf) => {
                    expect(buf).toExist();
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it("Returns buffer", function(done) {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(variablePlain)
                .then((buf) => {
                    expect(Buffer.isBuffer(buf)).toBeTruthy();
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it("Returns expected buffer", function(done) {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(variablePlain)
                .then((buf) => {
                    expect(buf).toEqual(Buffer.from(variableCipher.hex, 'hex'));
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    describe("Binary data", function() {

        it("Fails with no passphrase", function(done) {
            var options = {material: {
                iv: mocks.iv,
                salt: mocks.salt
            }},
            wcrypt = new Wcrypt.cipher(options);
            wcrypt.rawEncrypt(mocks.png)
            .catch((err) => {
                if (err.match(new RegExp(Config.err.passphrase))) {
                    done();
                }
                else {
                    done(err);
                }
            });
        });
    
        it("Accepts buffer", function(done) {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(mocks.png)
                .then((buf) => {
                    expect(buf).toExist();
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    
        it("Returns buffer", function(done) {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(mocks.png)
                .then((buf) => {
                    expect(Buffer.isBuffer(buf)).toBeTruthy();
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });

        it("Returns expected buffer", function(done) {
            var wcrypt = new Wcrypt.cipher(testOptions);
            wcrypt.rawEncrypt(mocks.png)
                .then(function(buf) {
                    var hash1, hash2;
                    wcrypt.crypto.subtle.digest( { name: "SHA-256", },
                        transcoder.buf2ab(buf))
                        .then(function(hash){
                            hash1 = Buffer.from(hash).toString('hex');
                            hash2 = mocks.pngCipherHash;
                            expect(hash1).toEqual(hash2);
                            done();
                        })
                        .catch(function(err){
                            done('Hash saved version: ' + err);
                        });
                })
                .catch(function (err) {
                    done('Encrypt: ' + err);
                });
        });
    });

    describe("Variants", function() {

        describe("encrypt", function() {
            it("Returns file signature", function(done) {
                var wcrypt = new Wcrypt.cipher(testOptions);
                wcrypt.encrypt(variablePlain)
                    .then((buf) => {
                        expect(buf.slice(0,11)).toEqual(
                            Buffer.from(wcrypt.getSignature())
                        );
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });
        });

        describe("encryptDelimited", function() {
            it("Returns expected delimiter", function(done) {
                var wcrypt = new Wcrypt.cipher(testOptions);
                wcrypt.encryptDelimited(variablePlain)
                    .then((buf) => {
                        expect(buf.slice(-8,buf.length)).toEqual(
                            Buffer.from(wcrypt.getDelimiter())
                        );
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            });
        });

    });

    describe("Version", function() {

        it("Returns expected value", function(done) {
            var wcrypt = new Wcrypt.cipher(testOptions);
            expect(Wcrypt.version).toEqual(Package.version);
            done();
        });

    });

});
