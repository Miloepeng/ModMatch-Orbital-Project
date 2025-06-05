import React, { useState } from 'react';
import { modules } from '../utils/modules';
import './Filter.css';

export default function Filter() {
    const [searchQuery, setSearchQuery] = useState("");
    const [examFilter, setExamFilter] = useState("all");
    const [gradedFilter, setGradedFilter] = useState("all");
    const [SUFilter, setSUFilter] = useState("all");

    const filteredModules = modules.filter((module) => {
        const matchesSearch = module.label.toUpperCase().includes(searchQuery.toUpperCase());
        const matchesExam = examFilter === 'all' || module.exam === examFilter;
        
        return matchesSearch && matchesExam;
    })

    return (
        <>
        <div>
            <div>
            <input
            className = "search-box"
            type="text"
            placeholder='Search...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
            </div>
            <select value={examFilter} onChange = {(e) => setExamFilter(e.target.value)} className="filter-box">
                <option value='all'>All</option>
                <option value='mcq'>MCQ</option>
                <option value='openended'>Open-Ended</option>
                <option value='mixed'>Mixed</option>
            </select>

            <ol className="modules-list">
                {filteredModules.map((module) => (
                    <li>{module.value} - {module.exam}</li>
                ))}
            </ol>
        </div>
        </>
    )
}