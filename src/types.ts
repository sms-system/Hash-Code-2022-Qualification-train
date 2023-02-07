export type InputData = {
    contributors: Array<Contributor>;
    projects: Array<Project>;
};

type Contributor = {
    name: string;
    skills: Array<Skill>;
};

type Skill = {
    name: string;
    level: number;
};

type Project = {
    name: string;
    daysToComplete: number;
    score: number;
    bestBefore: number;
    roles: Array<Skill>;
};

export type OutputData = {};

export type Solution = (input: InputData) => OutputData;