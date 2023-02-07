import _ = require("lodash");
import { OutputProject } from "../output";
import { Contributor, Project } from "../types";
import { InputData } from "../types";

// todo: add heuristics to take mentoring into account

export const solve = ({
    projects,
    contributors,
}: InputData): Array<OutputProject> => {
    const contributorSkillState: Array<Map<string, number>> = new Array(contributors.length);
    const contributorAvailable: Array<number> = new Array<number>(contributors.length).fill(0);

    const assignToProject = (project: Project, startTime: number) => {
        const res = [];
        for (const skill of project.roles) {
            let bestMatch = -1;
            let bestLevel = -1;
            for (let i = 0; i < contributorSkillState.length; i++) {
                const currentSkill = contributorSkillState[i].get(skill.name) ?? 0;
                if (contributorAvailable[i] < startTime || currentSkill < skill.level) {
                    continue;
                }
                if (bestMatch == -1 || currentSkill < bestLevel) {
                    bestMatch = i;
                    bestLevel = currentSkill;
                }
            }
            if (bestMatch == -1) {
                return [];
            }
            res.push(bestMatch)
        }
        return res;
    }
    
    for (let i = 0; i < contributors.length; i++) {
        contributorSkillState[i] = new Map();
        for (const skill of contributors[i].skills) {
            contributorSkillState[i].set(skill.name, skill.level);
        }
    }

    projects.sort((p1, p2) => (p1.bestBefore - p1.daysToComplete) - (p2.bestBefore - p2.daysToComplete));

    const result: Array<OutputProject> = [];

    for (const project of projects) {
        const projectStart = project.bestBefore - project.daysToComplete;
        const assignedMemberIndices = assignToProject(project, projectStart);
        if (assignedMemberIndices.length != project.roles.length) {
            // could not take this project
            continue;
        }
        for (const contributorId of assignedMemberIndices) {
            contributorAvailable[contributorId] = project.bestBefore;
        }

        result.push({
            "project": project.name,
            "contributors": assignedMemberIndices.map(i => contributors[i].name),
        });
        // recalculate skills according to mentoring scheme
        // const maxSkillLevel: Map<string, number> = new Map();
        // for (const contributorId of assignedMemberIndices) {
        //     for (let [skill, value] of contributorSkillState[contributorId]) {
        //         maxSkillLevel.set(skill, Math.max(maxSkillLevel.get(skill) ?? 0, value));
        //     }
        // }
        // for (const contributorId of assignedMemberIndices) {
        //     for (let [skill, maxLevel] of maxSkillLevel) {
        //         const newValue = Math.min(maxLevel, 1 + (maxSkillLevel.get(skill) ?? 0));
        //         contributorSkillState[contributorId].set(skill, newValue);
        //     }
        // }
    }

    return result;
}
