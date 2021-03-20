
import { Wristband } from '../interfaces/Wristband';

import { Database } from 'sqlite3';
import { EventEmitter } from 'events';
import path from 'path';

const DATABASE_PATH = path.join(__dirname, "../", "database.sqlite3");

export class Storage extends EventEmitter {
    private raw?: Database;

    constructor() {
        super();
    }

    async rewrite(serialNumber: string, reverse?: boolean): Promise<void> {
        await this.getWristband(serialNumber);

        return new Promise(resolve => {
            this.raw?.all(`
                UPDATE serials
                SET rewrites = rewrites + ?
                WHERE uuid = ?
            `, [reverse ? -1 : 1, serialNumber], () => resolve());
        })
    }

    async getWristband(serialNumber: string): Promise<Wristband> {
        const data = await this.serialFromDatabase(serialNumber);
        if (!!data) return data;

        return new Promise(resolve => {
            this.raw?.all(`
                INSERT INTO serials
                (uuid) VALUES (?)
            `, [serialNumber], () => {
                resolve(this.serialFromDatabase(serialNumber));
            })
        })
    }

    serialFromDatabase(serialNumber: string): Promise<Wristband> {
        return new Promise<Wristband>((resolve, reject) => {
            this.raw?.all(`
                SELECT * FROM serials
                WHERE uuid = ?
            `, [serialNumber], (_, [res]) => {
                resolve(res);
            })
        })
    }

    initialize(): Promise<void> {
        return new Promise(resolve => {
            this.raw?.run(`
                CREATE TABLE IF NOT EXISTS
                serials (
                    uuid TEXT,
                    rewrites INTEGER DEFAULT 0
                )
            `, () => resolve());
        })
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.raw = new Database(DATABASE_PATH, err => {
                if (!err) {
                    this.initialize().then(() => {
                        this.emit('ready');
                        resolve();
                    })
                    return;
                }
                this.emit('error', err);
                reject(err);
            })
        })
    }

}