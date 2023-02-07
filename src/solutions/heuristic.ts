import { Contributor, Project } from "../types";
import { InputData } from "../types";

// todo: add heuristics to take mentoring into account
const assignToProject = (project: Project, contributors: Array<Contributor>) => {
    // implement this pls
    return [];
}

export const solve = ({
    projects,
    contributors,
}: InputData): any => {
    const contributorSkillState = contributors.map(c => [...c.skills]);
    projects.sort((p1, p2) => (p1.bestBefore - p1.daysToComplete) - (p2.bestBefore - p2.daysToComplete));

    for (const project of projects) {
        const assignedMembers = assignToProject(project, contributors);
        // recalculate skills according to mentoring scheme
    }

    return {};
}
