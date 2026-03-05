import * as xlsx from 'xlsx';
import { parseISO, isValid } from 'date-fns';

export const parseExcelFile = (buffer) => {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { raw: false });

    const tasks = [];
    const errors = [];

    data.forEach((row, index) => {
        // Expected columns: Date, Section, Topic, Task, Estimated Time
        const dateStr = row['Date'];
        const section = row['Section'];
        const topic = row['Topic'];
        const description = row['Task'];
        const estimatedTime = row['Estimated Time'];

        if (!dateStr || !section || !topic || !description || !estimatedTime) {
            errors.push(`Row ${index + 2}: Missing required fields`);
            return;
        }

        let date;
        try {
            // date parsing might be tricky with excel formats, assuming YYYY-MM-DD
            date = new Date(dateStr);
            if (!isValid(date)) {
                throw new Error('Invalid date');
            }
        } catch (err) {
            errors.push(`Row ${index + 2}: Invalid date format - ${dateStr}`);
            return;
        }

        if (!['QA', 'VARC', 'DILR', 'Revision', 'Mock'].includes(section)) {
            errors.push(`Row ${index + 2}: Invalid section - ${section}`);
            return;
        }

        const time = parseInt(estimatedTime, 10);
        if (isNaN(time)) {
            errors.push(`Row ${index + 2}: Invalid estimated time - ${estimatedTime}`);
            return;
        }

        tasks.push({
            date,
            section,
            topic,
            description,
            estimatedTime: time,
        });
    });

    return { tasks, errors };
};
