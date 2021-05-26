require('dotenv').config()

const mysql = require('mysql')
const util = require('util')
const connection = mysql. createConnection({
    connectionLimit: 5,
    host: process.env.HOST,
    user: process.env.USER,
    database: process.env.DB_NAME,
    password: process.env.PASSWORD,
    multipleStatements: true,
})


connection.connect()

const query = util.promisify(connection.query).bind(connection)

const createSql = `
    CREATE TABLE IF NOT EXISTS english(
        word_id INT NOT NULL AUTO_INCREMENT,
        word CHAR(255) NOT NULL,
        UNIQUE (word),
        PRIMARY KEY (word_id)
    );

    CREATE TABLE IF NOT EXISTS japanese(
        word_id INT NOT NULL AUTO_INCREMENT,
        word CHAR(255) NOT NULL,
        strokes CHAR(255) NOT NULL,
        UNIQUE (word),
        PRIMARY KEY (word_id)
    );

    CREATE TABLE IF NOT EXISTS russian(
        word_id INT NOT NULL AUTO_INCREMENT,
        word CHAR(255) NOT NULL,
        UNIQUE (word),
        PRIMARY KEY (word_id)
    );

    CREATE TABLE IF NOT EXISTS english_japanese(
        english_word_id INT NOT NULL,
        japanese_word_id INT NOT NULL,
        FOREIGN KEY (english_word_id) REFERENCES english(word_id) ON UPDATE CASCADE,
        FOREIGN KEY (japanese_word_id) REFERENCES japanese(word_id) ON UPDATE CASCADE,
    );gre
    CREATE TABLE IF NOT EXISTS english_russian(
        english_word_id INT NOT NULL,
        russian_word_id INT NOT NULL,
        FOREIGN KEY (english_word_id) REFERENCES english(word_id) ON UPDATE CASCADE,
        FOREIGN KEY (russian_word_id) REFERENCES russian(word_id) ON UPDATE CASCADE,
    );
    CREATE TABLE IF NOT EXISTS japanese_russian(
        japanese_word_id INT NOT NULL,
        russian_word_id INT NOT NULL,
        FOREIGN KEY (japanese_word_id) REFERENCES japanese(word_id) ON UPDATE CASCADE,
        FOREIGN KEY (russian_word_id) REFERENCES russian(word_id) ON UPDATE CASCADE,
    );

    CREATE TABLE IF NOT EXISTS kunyomi (
        kunyomi_id INT AUTO_INCREMENT,
        kunyomi CHAR(255) NOT NULL,
        UNIQUE(kunyomi),
        PRIMARY KEY(kunyomi_id)
    );

    CREATE TABLE IF NOT EXISTS onyomi (
        onyomi_id INT AUTO_INCREMENT,
        onyomi CHAR(255) NOT NULL,
        UNIQUE(onyomi),
        PRIMARY KEY(onyomi_id)
    );

    CREATE TABLE IF NOT EXISTS japanese_sentences (
        sentence_id INT AUTO_INCREMENT,
        sentence CHAR(255) NOT NULL,
        UNIQUE(sentence),
        PRIMARY KEY(sentence_id)
    );

    CREATE TABLE IF NOT EXISTS english_sentences (
        sentence_id INT AUTO_INCREMENT,
        sentence CHAR(255) NOT NULL,
        UNIQUE(sentence),
        PRIMARY KEY(sentence_id)
    );

    CREATE TABLE IF NOT EXISTS russian_sentences (
        sentence_id INT AUTO_INCREMENT,
        sentence CHAR(255) NOT NULL,
        UNIQUE(sentence),
        PRIMARY KEY(sentence_id)
    );

    CREATE TABLE IF NOT EXISTS language (
        id INT PRIMARY KEY AUTO_INCREMENT,
        language_name CHAR(255) NOT NULL,
        UNIQUE(language_name)
    );
`;
(async () => {
    try {
        const rows = await query(createSql)
        console.log(rows)
    } catch (err) {
        console.log(err.massage)
    } finally {
        connection.end()
    }
})()
