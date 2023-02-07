import * as fs from 'fs';
import parseInput from './input';
import { InputData, OutputData } from './types';
import { numbers } from './parser';
import assert from 'assert';
import _ from "lodash";

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
