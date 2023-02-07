import * as fs from 'fs';
import parseInput from './input';
import { Contributor, InputData, OutputData, Project } from './types';
import * as assert from 'assert';
import { Output } from "./output";

interface ProjectWIP {
    project: Project;
    doneAt: number;
    contributorNames: Array<string>;
}

export function emulation(input: InputData, output: Output) {
    const projectsWIP: Array<ProjectWIP> = [];
    const projectsInput = new Map(input.projects.map(project => [project.name, project]));
    let nonStartedProjects = [...output];

    const allContributors: Map<string, Contributor> = new Map(
        JSON.parse(JSON.stringify(input.contributors))
            .map(x => [x.name, x])
    );
    const contributorsAssigned: Set<string> = new Set();

    let now = 0;
    let score = 0;
    while (true) {
        // assignments
        const skipProjects = [];
        for (const projectOutput of nonStartedProjects) {
            const contributorNames: Array<string> = projectOutput.contributors;
            const everyFree = contributorNames.every(c => !contributorsAssigned.has(c));
            if (!everyFree) {
                skipProjects.push(projectOutput);
                continue;
            }
            const projectInput = projectsInput.get(projectOutput.project);

            assert.equal(contributorNames.length, projectInput.roles.length);

            const roleNames = new Set(projectInput.roles.map(role => role.name));
            const contributors = contributorNames.map(c => allContributors.get(c));

            const topSkills = new Map(Array.from(roleNames).map(skillName => [
                skillName,
                Math.max(
                    ...contributors.map(c => c.skills.find(skill => skill.name === skillName)?.level || 0)
                )
            ]));
            // check skill issues
            for (const role of projectInput.roles) {
                assert(role.level <= topSkills.get(role.name));
            }
            // remove contributors from pool
            contributors.forEach(c => {
                contributorsAssigned.add(c.name);
            });
            // levelup contributors
            for (let roleId = 0; roleId < projectInput.roles.length; roleId++) {
                const role = projectInput.roles[roleId];
                const contributor = contributors[roleId];
                const hasSkill = contributor.skills.find(skill => skill.name === role.name);
                if (hasSkill) {
                    if (hasSkill.level + 1 === role.level) {
                        hasSkill.level += 1;
                    }
                } else {
                    if (role.level === 1) {
                        contributor.skills.push({ name: role.name, level: 1 });
                    }
                }
            }
            projectsWIP.push({
                project: projectInput,
                doneAt: now + projectInput.daysToComplete,
                contributorNames: contributorNames,
            });

        }
        nonStartedProjects = skipProjects;

        // resets
        for (const { project, contributorNames, doneAt } of projectsWIP) {
            if (doneAt === now) {
                score += project.bestBefore >= now ?  project.score : Math.max(0, project.score - (now - project.bestBefore));
            }
            // return contributors to pool
            contributorNames.forEach(name => {
                contributorsAssigned.delete(name);
            });
        }

        now++;
        if (projectsWIP.length === 0 && nonStartedProjects.length === 0) {
            break;
        }
    }

    return score;
}

function parseOutput(outputContent: string): OutputData {
    const res: OutputData = {};
    const lines = outputContent.split('\n').reverse();

    return res;
}

export function calculateScoreFile(inputPath: string, outputPath: string) {
    const outputContent = fs.readFileSync(outputPath, 'utf-8');
    const output = parseOutput(outputContent);
    return calculateScore(inputPath, output);
}

function validateOutput(input: InputData, output: OutputData) {
    assert.equal(1, 1);
}

export function calculateScore(inputPath: string, output: OutputData): number {
    const input = parseInput(inputPath);

    validateOutput(input, output);

    return 0;
}
