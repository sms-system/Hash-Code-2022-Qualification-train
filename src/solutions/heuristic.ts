import Heap = require("heap");
import _ = require("lodash");
import { OutputProject } from "../output";
import { Contributor, Project } from "../types";
import { InputData } from "../types";

export const solve = ({
    projects,
    contributors,
}: InputData): Array<OutputProject> => {
    const contributorSkillState: Array<Map<string, number>> = new Array(contributors.length);
    const contributorAvailable: Array<number> = new Array<number>(contributors.length).fill(0);
    const projectStarted: Array<boolean> = new Array(projects.length).fill(false);

    const assignToProject = (project: Project, startTime: number) => {
        const res = [];
        const used = new Set<number>();
        for (const role of project.roles) {
            let bestMatch = -1;
            let bestLevel = -1;
            for (let i = 0; i < contributorSkillState.length; i++) {
                const currentSkill = contributorSkillState[i].get(role.name) ?? 0;
                if (used.has(i) || contributorAvailable[i] < startTime || currentSkill < role.level) {
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
            used.add(bestMatch);
            res.push(bestMatch);
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
    const times = new Heap<number>();
    times.push(0);

    while (!times.empty()) {
        const t = times.pop()!;
        // find the best project to start
        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            const projectStart = project.bestBefore - project.daysToComplete;
            if (projectStarted[i]) {
                continue;
            }
            const assignedMemberIndices = assignToProject(project, projectStart);
            if (assignedMemberIndices.length != project.roles.length) {
                // could not take this project
                continue;
            }
            for (const contributorId of assignedMemberIndices) {
                contributorAvailable[contributorId] = t + project.daysToComplete;
            }
            // recalculate skills according to mentoring scheme
            // const maxSkillLevel: Map<string, number> = new Map();
            // for (const contributorId of assignedMemberIndices) {
            //     for (let [skill, value] of contributorSkillState[contributorId]) {
            //         maxSkillLevel.set(skill, Math.max(maxSkillLevel.get(skill) ?? 0, value));
            //     }
            // }
            for (let i = 0; i < project.roles.length; i += 1) {
                const role = project.roles[i];
                const skillState = contributorSkillState[assignedMemberIndices[i]];
                const curSkillLevel = skillState.get(role.name) ?? 0;
                if (curSkillLevel <= role.level) {
                    skillState.set(role.name, curSkillLevel + 1);
                }
            }
            console.log(`Starting project ${project.name} at ${t}`);
            result.push({
                "project": project.name,
                "contributors": assignedMemberIndices.map(i => contributors[i].name),
            }); 
            projectStarted[i] = true;  
            times.push(t + project.daysToComplete);
        }
    }

    return result;
}
