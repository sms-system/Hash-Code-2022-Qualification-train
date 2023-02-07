import { Contributor, InputData, Project } from './types';
import * as assert from 'assert';
import { Output } from "./output";
import { has } from "lodash";

interface ProjectWIP {
    project: Project;
    doneAt: number;
    memberIds: Array<number>;
}

export function calculateScore(input: InputData, output: Output): number {
    let projectsWIP: Array<ProjectWIP> = [];
    const projectsInput = new Map(input.projects.map(project => [project.name, project]));
    let nonStartedProjects = [...output];

    const contributors: Array<Contributor> = JSON.parse(JSON.stringify(input.contributors));
    const contributorsIndexByName: Map<string, number> = new Map(
        input.contributors.map((value, index) => [value.name, index])
    );
    const contributorSkills: Array<Map<string, number>> = contributors.map(c => {
        return new Map(c.skills.map(s => [s.name, s.level]));
    });

    const contributorsAssigned = new Set<number>();

    let now = 0;
    let score = 0;
    while (true) {
        assert.ok(now < 500000, 'TIME LIMIT');
        // assignments
        const skipProjects = [];
        for (const projectOutput of nonStartedProjects) {
            const contributorNames: Array<string> = projectOutput.contributors;
            const memberIds = contributorNames.map(name => {
                assert.ok(contributorsIndexByName.has(name));
                return contributorsIndexByName.get(name)!;
            });

            const everyFree = memberIds.every(m => !contributorsAssigned.has(m));
            if (!everyFree) {
                skipProjects.push(projectOutput);
                continue;
            }
            const project = projectsInput.get(projectOutput.project)!;

            assert.equal(contributorNames.length, project.roles.length);

            for (let i = 0; i < contributors.length; i++) {
                const role = project.roles[i];
                const contributorLevels = contributorSkills[memberIds[i]];
                const skill = contributorLevels.get(role.name) || 0;
                assert.ok(role.level > skill + 1, `Invalid skill for role ${role.name} on project ${project.name}`);
                if (skill == role.level) {
                    continue;
                }
                let hasMentor = false;
                for (let j = 0; j < contributors.length && !hasMentor; j++) {
                    const skill = contributorSkills[memberIds[j]].get(role.name) || 0;
                    hasMentor = skill >= role.level;
                }
                assert.ok(hasMentor, `Invalid skill for role ${role.name} on project ${project.name}`)
            }

            // remove contributors from pool
            memberIds.forEach(member => contributorsAssigned.add(member));

            for (let i = 0; i <= contributors.length; i++) {
                const role = project.roles[i];
                const contributorLevels = contributorSkills[memberIds[i]];
                const currentSkill = contributorLevels.get(role.name) || 0;
                const newValue = Math.min(currentSkill + 1, role.level + 1);
                contributorLevels.set(role.name, newValue);
            }

            projectsWIP.push({
                project,
                doneAt: now + project.daysToComplete,
                memberIds,
            });

        }
        nonStartedProjects = skipProjects;

        const skipProjectsWIP = [];
        // resets
        for (const { project, memberIds, doneAt } of projectsWIP) {
            if (doneAt === now) {
                score += Math.max(0, project.score - Math.min(0, project.bestBefore - now));
            } else {
                skipProjectsWIP.push({ project, memberIds, doneAt });
                assert.ok(doneAt > now);
            }
            // return contributors to pool
            memberIds.forEach(member => {
                contributorsAssigned.delete(member);
            });
        }
        projectsWIP = skipProjectsWIP;

        now++;
        if (projectsWIP.length === 0 && nonStartedProjects.length === 0) {
            break;
        }
    }

    return score;
}
