import React, { useState, useEffect } from 'react';
import { modules, Modules, GEN, CD, ID, GEI, GEA, GEX, GEC, GESS } from '../utils/modules';
import './Filter.css';

export default function Filter() {
    const [searchQuery, setSearchQuery] = useState("");
    const [examFilter, setExamFilter] = useState("all");
    const [gradedFilter, setGradedFilter] = useState("all");
    const [SUFilter, setSUFilter] = useState("all");

    const allModules = [Modules, GEN, CD, ID, GEI, GEA, GEX, GEC, GESS].flat();

    const filteredModules = allModules.filter((module) => {
        const matchesSearch = module.label.toUpperCase().includes(searchQuery.toUpperCase());
        /*const matchesExam = examFilter === 'all' || module.exam === examFilter;*/
        const matchesSU = SUFilter === 'all' || module.canSU === SUFilter;
        
        return matchesSearch && matchesSU;
    })

    /*Split filteredModules into 10 modules a page*/
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 10;
    const indexOfLastItem = currentPage * resultsPerPage;
    const indexOfFirstItem = indexOfLastItem - resultsPerPage;
    const currentModules = filteredModules.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredModules.length / resultsPerPage);
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, examFilter, gradedFilter, SUFilter])
    const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

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
            <select value={SUFilter} onChange = {(e) => setSUFilter(e.target.value)} className="filter-box">
                <option value='all'>All</option>
                <option value='True'>True</option>
                <option value='False'>False</option>
            </select>

            <ol className="modules-list">
                {currentModules.map((module) => (
                    <li>{module.value} - {module.canSU}</li>
                ))}
            </ol>

            <div className="pagination">
          <button onClick={handlePrev} disabled={currentPage === 1}>Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
            </div>
        </div>
        </>
    )
}