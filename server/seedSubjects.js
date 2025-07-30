import prisma from './config/database.js';
import { ObjectId } from 'mongodb';


const subjectMap = {
    COMPUTER: {
        1: ['Programming Fundamentals', 'Engineering Mathematics-I', 'Digital Logic Design', 'Computer Organization', 'Communication Skills'],
        2: ['Data Structures', 'Engineering Mathematics-II', 'Object Oriented Programming', 'Environmental Studies', 'Discrete Mathematics'],
        3: ['Operating Systems', 'DBMS', 'Computer Networks', 'Software Engineering', 'Microprocessors'],
        4: ['Web Tech', 'DAA', 'Computer Architecture', 'Theory of Computation', 'Professional Ethics'],
        5: ['AI', 'ML', 'Data Mining', 'Compiler Design', 'HCI'],
        6: ['Mobile Computing', 'Cloud Computing', 'Cyber Security', 'IoT', 'Data Visualization'],
        7: ['Big Data', 'Blockchain', 'Adv DBMS', 'Soft Computing', 'Elective I'],
        8: ['Deep Learning', 'NLP', 'Elective II', 'Project Work', 'Internship'],
    },
    MECHANICAL: {
        1: ['Engg Mechanics', 'Math-I', 'Engg Graphics', 'Electrical Engg', 'Communication Skills'],
        2: ['Thermodynamics', 'Math-II', 'Material Science', 'Manufacturing Processes', 'Environmental Studies'],
        3: ['Fluid Mechanics', 'SOM', 'Machine Drawing', 'Applied Thermo', 'Kinematics'],
        4: ['DOM', 'Heat Transfer', 'Industrial Engg', 'Measurements', 'CAD/CAM'],
        5: ['Machine Design', 'IC Engines', 'Refrigeration', 'Mechatronics', 'Elective I'],
        6: ['Robotics', 'FEA', 'Prod Planning', 'Vibration', 'QC'],
        7: ['Composites', 'Renewable Energy', 'Automobile Engg', 'Elective II', 'Seminar'],
        8: ['Project', 'Maintenance Engg', 'Elective III', 'Internship', 'OR'],
    },
    ELECTRICAL: {
        1: ['Basic EE', 'Math-I', 'Physics', 'Engg Graphics', 'Communication Skills'],
        2: ['Circuit Analysis', 'Math-II', 'Analog Electronics', 'Digital Electronics', 'Environmental Studies'],
        3: ['Machines I', 'Network Analysis', 'Power Systems I', 'EM Fields', 'Control Systems'],
        4: ['Machines II', 'Microcontrollers', 'Power Electronics', 'Signals & Systems', 'Measurements'],
        5: ['Switchgear', 'Drives', 'Automation', 'Instrumentation', 'Elective I'],
        6: ['HVDC', 'Renewable Energy', 'Smart Grids', 'EVs', 'Power Quality'],
        7: ['Adv Control', 'Energy Audit', 'DSP', 'Elective II', 'Seminar'],
        8: ['Project', 'Internship', 'Safety', 'Elective III', 'HV Engg'],
    },
    CIVIL: {
        1: ['Engg Mechanics', 'Math-I', 'Graphics', 'Basic EE', 'Comm Skills'],
        2: ['Surveying', 'Math-II', 'Materials', 'Fluid Mechanics', 'Env Studies'],
        3: ['Structural Analysis I', 'Concrete Tech', 'GeoTech', 'Geology', 'Transportation I'],
        4: ['Structural II', 'Water Resources', 'Construction Planning', 'Soil Mech', 'Transportation II'],
        5: ['RCC Design', 'Steel Design', 'Env Engg I', 'Estimation', 'Elective I'],
        6: ['Env Engg II', 'Advanced Surveying', 'Prestressed Conc.', 'Constr. Mgmt.', 'Ground Techniques'],
        7: ['Earthquake Engg', 'GIS', 'Traffic Engg', 'Elective II', 'Seminar'],
        8: ['Project', 'Internship', 'Building Services', 'Quantity Survey', 'Elective III'],
    },
    CHEMICAL: {
        1: ['Chemistry', 'Math-I', 'Comm Skills', 'Basics Chem Engg', 'Graphics'],
        2: ['Math-II', 'Env Studies', 'Fluid Flow', 'Organic Chem', 'Process Calc'],
        3: ['Thermodynamics', 'Mechanical Ops', 'Heat Transfer', 'Instrumentation', 'Physical Chem'],
        4: ['Mass Transfer I', 'Reaction Engg I', 'Energy Engg', 'Numerical Methods', 'Safety'],
        5: ['Mass Transfer II', 'Reaction Engg II', 'Equip Design', 'Petroleum', 'Elective I'],
        6: ['Biochem Engg', 'Polymer Tech', 'Process Control', 'Utilities', 'Transport Phenomena'],
        7: ['Pollution Control', 'Modeling', 'Nanotech', 'Elective II', 'Seminar'],
        8: ['Project', 'Internship', 'Optimization', 'Plant Design', 'Elective III'],
    },
};

async function seedSubjects() {
    try {
        // Map branches to department names
        const departmentMap = {
            COMPUTER: 'Computer Science and Engineering',
            MECHANICAL: 'Mechanical Engineering',
            ELECTRICAL: 'Electrical Engineering',
            CIVIL: 'Civil Engineering',
            CHEMICAL: 'Chemical Engineering',
        };

        // Create or get departments
        const departments = {};
        // Generate temporary but valid ObjectIDs
        const tempHodIds = {
            COMPUTER: new ObjectId().toString(),
            MECHANICAL: new ObjectId().toString(),
            ELECTRICAL: new ObjectId().toString(),
            CIVIL: new ObjectId().toString(),
            CHEMICAL: new ObjectId().toString(),

            // ... other departments
        };
        for (const branch of Object.keys(subjectMap)) {
            const departmentName = departmentMap[branch];
            let department = await prisma.department.findUnique({
                where: { name: departmentName },
            });

            if (!department) {
                department = await prisma.department.create({
                    data: {
                        name: departmentName,
                        hodId: tempHodIds[branch],
                    },
                });
            }
            departments[branch] = department.id;
        }

        // Seed subjects
        let subjectCount = 0;
        for (const branch of Object.keys(subjectMap)) {
            const semMap = subjectMap[branch];
            const departmentId = departments[branch];

            for (const sem of Object.keys(semMap)) {
                const semester = parseInt(sem);
                const subjects = semMap[semester];

                for (const name of subjects) {
                    // Check if subject already exists to avoid duplicates
                    const existingSubject = await prisma.subject.findFirst({
                        where: {
                            name,
                            semester,
                            departmentId,
                        },
                    });

                    if (!existingSubject) {
                        await prisma.subject.create({
                            data: {
                                name,
                                semester,
                                departmentId,
                            },
                        });
                        subjectCount++;
                    }
                }
            }
        }

        console.log(`✅ Seeded ${subjectCount} subjects!`);
    } catch (error) {
        console.error('Error seeding subjects:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedSubjects();