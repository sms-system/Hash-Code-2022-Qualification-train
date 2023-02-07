import { Output } from "./output";

export type InputData = {
    contributors: Array<Contributor>;
    projects: Array<Project>;
};

export type Contributor = {
    name: string;
    skills: Array<Skill>;
};

export type Skill = {
    name: string;
    level: number;
};

export type Project = {
    name: string;
    daysToComplete: number;
    score: number;
    bestBefore: number;
    roles: Array<Skill>;
};

export type Solution = (input: InputData) => Output;
