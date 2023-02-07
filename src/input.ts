import * as fs from "fs";
import type { Contributor, InputData, Project, Skill } from "./types";
import { numbers } from "./parser";

export default function readFile(filename: string): InputData {
    const data = fs.readFileSync(filename, 'utf-8');
    const lines = data.split('\n').reverse();

    let [c, p] = numbers(lines);
    const contributors: Array<Contributor> = [];
    while (c--) {
        let [name, nString] = lines.pop()!.split(" ");
        let n = Number(nString);
        const skills: Array<Skill> = [];
        while (n--) {
            let [skillName, lvlStr] = lines.pop()!.split(" ");
            skills.push({
                name: skillName,
                level: Number(lvlStr),
            });
        }
        contributors.push({ name, skills });
    }

    const projects: Array<Project> = [];
    while (p--) {
        let [name, dString, sString, bString, rString] = lines.pop()!.split(" ");
        const roles: Array<Skill> = [];
        let r = Number(rString);
        while (r--) {
            const [name, lvlStr] = lines.pop()!.split(" ");
            roles.push({
                name,
                level: Number(lvlStr),
            });
        }

        projects.push({
            name,
            daysToComplete: Number(dString),
            score: Number(sString),
            bestBefore: Number(bString),
            roles,
        });
    }

    return { contributors, projects };
}
