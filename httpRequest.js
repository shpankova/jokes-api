/* eslint-disable require-jsdoc */
const https = require("https");
const Transform = require("stream").Transform;
const fs = require("fs");
const process = require("process");

const header = require("./header.json");
const jokeUrl = new URL("https://icanhazdadjoke.com/");
const term = process.argv[3] ? process.argv[3] : '';
const filename = process.argv[5] || "jokes";

function createWriteStream(filename) {
    const writer = fs.createWriteStream(`${filename}.csv`);
    writer.write(header.join(",") + "\n");
    return writer;
}

function createParser() {
    const transform = new Transform();
    let data = "";
    transform._transform = (chunk, _, done) => {
        try {
            const rows = chunk.toString();
            data += rows;

            const parsed = JSON.parse(data);
            done(
                null,
                parsed.results.reduce((acc, r) => {
                    return `${acc}${r.id}|${r.joke}\n`;
                }, ""),
            );

        } catch {
            done(null, "");
        }
    };
    return transform;
}

function httpRequest(requestUrl) {
    const options = {
        hostname: requestUrl.host,
        method: "GET",
        headers: { Accept: "application/json" },
        path: requestUrl.pathname + requestUrl.search,
    };
    const req = https.request(options, (res) => {
        // eslint-disable-next-line max-len
        res.pipe(createParser()).pipe(createWriteStream(filename));
    });
    req.end();
}

function getJokes(term) {
    try {
        const jokeTermUrl = new URL(jokeUrl.href);
        jokeTermUrl.pathname = "/search";
        jokeTermUrl.searchParams.set("term", term);

        const csvFiles = httpRequest(jokeTermUrl);
        return csvFiles;
    } catch (e) {
        console.log(e);
    }
}

getJokes(term);


