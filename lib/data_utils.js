import fs from 'fs';
import path from 'path';

const dataDirectory = path.join(process.cwd(), 'data');

export function getData(type='fii') {
    // Get file names under /data
    const fileNames = fs.readdirSync(getDataPath(type));
    const allData = fileNames
                        .filter((fileName) => fileName.includes('.json'))
                        .map((fileName) => {
        // Remove ".md" from file name to get id
        // const ticker = fileName.replace(/\.md$/, '');

        // Read markdown file as string
        const fullPath = path.join(getDataPath(type), fileName);
        const rawdata = fs.readFileSync(fullPath, 'utf8');

        const data = JSON.parse(rawdata);

        // informa o tipo para identificar o dado
        data['data_type'] = type;

        // Combine the data with the id
        return data;
    }).filter(it => it!=null);

    return allData;
}

export function getConfig(type='fii') {
    // Get file names under /data
    const rawdata = fs.readFileSync(getConfigPath(), 'utf8');

    const data = JSON.parse(rawdata);

    return data[type];
}

export function getDataPath(type='fii') {
    return `${dataDirectory}/${type}`
}

export function getConfigPath() {
    return `${dataDirectory}/config.json`
}