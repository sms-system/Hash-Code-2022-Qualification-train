import { Contributor, InputData, Project } from './types';
import * as assert from 'assert';
import { Output } from "./output";
import { has } from "lodash";
import _ = require('lodash');

interface ProjectWIP {
    project: Project;
    doneAt: number;
    memberIds: Array<number>;
}

export function calculateScore(input: InputData, output: Output): number {
    const projectsInput = new Map(input.projects.map(project => [project.name, project]));

    const contributors: Array<Contributor> = JSON.parse(JSON.stringify(input.contributors));
    const contributorsIndexByName: Map<string, number> = new Map(
        input.contributors.map((value, index) => [value.name, index])
    );
    const contributorSkills: Array<Map<string, number>> = contributors.map(c => {
        return new Map(c.skills.map(s => [s.name, s.level]));
    });

    const contributorFreeTime = new Map<number, number>();

    let score = 0;
    let now = 0;

    for (const projectOutput of output) {
        const contributorNames: Array<string> = projectOutput.contributors;
        const memberIds = contributorNames.map(name => {
            assert.ok(contributorsIndexByName.has(name));
            return contributorsIndexByName.get(name)!;
        });
        const allFreeTime = _.max(memberIds.map(mid => contributorFreeTime.get(mid) || 0).concat(now))!;
        now = allFreeTime;
        const project = projectsInput.get(projectOutput.project)!;
        // console.log("Project", project, projectOutput, now);
        // console.log(contributorSkills);

        assert.equal(contributorNames.length, project.roles.length);

        for (let i = 0; i < memberIds.length; i++) {
            const role = project.roles[i];
            const contributorLevels = contributorSkills[memberIds[i]];
            const skill = contributorLevels.get(role.name) || 0;
            assert.ok(role.level <= skill + 1, `Invalid skill for role ${role.name} for ${contributors[memberIds[i]].name} on project ${project.name}`);
            if (skill >= role.level) {
                continue;
            }
            let hasMentor = false;
            for (let j = 0; j < memberIds.length && !hasMentor; j++) {
                const skill = contributorSkills[memberIds[j]].get(role.name) || 0;
                hasMentor = skill >= role.level;
            }
            assert.ok(hasMentor, `Invalid skill for role ${role.name} on project ${project.name}`)
        }

        const endDate = allFreeTime + project.daysToComplete;
        memberIds.forEach(member => contributorFreeTime.set(member, endDate));

        for (let i = 0; i < memberIds.length; i++) {
            const role = project.roles[i];
            const contributorLevels = contributorSkills[memberIds[i]];
            const currentSkill = contributorLevels.get(role.name) || 0;
            const newValue = Math.max(currentSkill, Math.min(currentSkill + 1, role.level + 1));
            // console.log(`Updated skill ${role.name} of ${contributors[memberIds[i]].name} to ${newValue}`)
            contributorLevels.set(role.name, newValue);
        }

        score += Math.max(0, project.score - Math.min(0, project.bestBefore - endDate));
    }

    return score;
}
