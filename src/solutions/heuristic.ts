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

    function score(project: Project, startTime: number): number {
        const endTime = startTime + project.daysToComplete;
        return Math.max(0, project.score - Math.max(0, endTime - project.bestBefore));
    }

    const result: Array<OutputProject> = [];
    const times = new Heap<number>();
    times.push(0);

    while (!times.empty()) {
        const t = times.pop()!;
        // find the best project to start
        projects = projects.filter((p, i) => !projectStarted[i]);
        projects = _.sortBy(projects, project => {
            return -score(project, t) / project.roles.length / project.daysToComplete;
        });

        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            const endDate = t + project.daysToComplete;
            const assignedMemberIndices = assignToProject(project, t);
            if (assignedMemberIndices.length != project.roles.length) {
                // could not take this project
                continue;
            }
            for (const contributorId of assignedMemberIndices) {
                contributorAvailable[contributorId] = endDate;
            }
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

            console.log(`Project ${project.name} will end at ${endDate}, score will be ${score(project, t)}`);
            times.push(endDate);
        }
    }

    return result;
}
