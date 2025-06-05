import React, { useState } from 'react';
import { modules } from '../utils/modules'

export default function Filter() {
    const [searchQuery, setSearchQuery] = useState("");
    const [examFilter, setExamFilter] = useState("all");
    const [gradedFilter, setGradedFilter] = useState("all");
    const [SUFilter, setSUFilter] = useState("all");

    const filteredModules = modules.filter((module) => {
        const matchesSearch = module.label.toUpperCase().includes(searchQuery);
        const matchesExam = examFilter === 'all' || module.exam === examFilter;
        
        return matchesSearch && matchesExam;
    })

    return (
        <>
        <div>
            <input
            type="text"
            placeholder='Search...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select value={examFilter} onChange = {(e) => setExamFilter(e.target.value)}>
                <option value='all'>All</option>
                <option value='mcq'>MCQ</option>
                <option value='openended'>Open-Ended</option>
                <option value='mixed'>Mixed</option>
            </select>

            <ul>
                {filteredModules.map((module) => (
                    <li>{module.value} - {module.exam}</li>
                ))}
            </ul>
        </div>
        </>
    )
}