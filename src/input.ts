import * as fs from "fs";
import type { CacheServer, Endpoint, Request, InputData } from "./types";
import { numbers } from "./parser";

export default function readFile(filename: string): InputData {
    const data = fs.readFileSync(filename, 'utf-8');
    const lines = data.split('\n').reverse();
    let [v, e, r, cacheServersCount, cacheServerSize] = numbers(lines);
    const videoSizes = numbers(lines);
    const endpoints: Array<Endpoint> = [];

    while (e--) {
        let [dataCenterlatency, k] = numbers(lines);
        const cacheServers: Array<CacheServer> = [];
        while (k--) {
            const [cacheServerId, endpointLatency] = numbers(lines);
            cacheServers.push({cacheServerId, endpointLatency});
        }
        endpoints.push({
            dataCenterlatency,
            cacheServers,
        });
    }

    const requests: Array<Request> = [];
    while (r--) {
        const [videoId, endpointId, requestsAmount] = numbers(lines);
        requests.push({ videoId, endpointId, requestsAmount });
    }

    return {
        videoSizes,
        endpoints,
        requests,
        cacheServerSize,
        cacheServersCount,
    };
}
