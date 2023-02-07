export interface Project {
    project: string;
    contributors: Array<string>;
}

export type Output = Array<Project>;


export function format(result: Output) {
    return [
        result.length,
        ...result.map(p => `${p.project}\n${p.contributors.join(' ')}`)
    ].join('\n')
}
