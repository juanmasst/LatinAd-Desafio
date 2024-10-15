const { contextBridge } = require('electron');
const fs = require('fs');
const NeDB = require('nedb');
const path = require('path');

const db = new NeDB({ filename: path.join(__dirname, '../media.db'), autoload: true });

contextBridge.exposeInMainWorld('electron', {
    saveMedia: (media) => {
        return new Promise((resolve, reject) => {
            db.insert(media, (err, newDoc) => {
                if (err) return reject(err);
                resolve(newDoc);
            });
        });
    },
    getMedia: () => {
        return new Promise((resolve, reject) => {
            db.find({}, (err, docs) => {
                if (err) return reject(err);
                resolve(docs);
            });
        });
    },
    clearMedia: () => {
        return new Promise((resolve, reject) => {
            db.remove({}, { multi: true }, (err, numRemoved) => {
                if (err) return reject(err);
                resolve(numRemoved);
            });
        });
    }
});
