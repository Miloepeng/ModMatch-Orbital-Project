import React, { useState, useEffect } from 'react';
import { modules, Modules, GEN, CD, ID, GEI, GEA, GEX, GEC, GESS } from '../utils/modules';
import './Filter.css';

export default function Filter() {
    const [searchQuery, setSearchQuery] = useState("");
    const [MCQFilter, setMCQFilter] = useState("all");
    const [gradedFilter, setGradedFilter] = useState("all");
    const [SUFilter, setSUFilter] = useState("all");
    const [groupFilter, setGroupFilter] = useState('all');
    const [GEFilter, setGEFilter] = useState('all');

    const allModules = [Modules, GEN, CD, ID, GEI, GEA, GEX, GEC, GESS].flat();

    const filteredModules = allModules.filter((module) => {
        const matchesSearch = module.label.toUpperCase().includes(searchQuery.toUpperCase());
        /*const matchesExam = examFilter === 'all' || module.exam === examFilter;*/
        const matchesSU = SUFilter === 'all' || module.canSU === SUFilter;
        const matchesGraded = gradedFilter ==='all' || module.passFail === gradedFilter;
        const matchesGroup = groupFilter === 'all' || module.hasGroupProject === groupFilter;
        const matchesGE = GEFilter === 'all' || module.GEPillar === GEFilter;
        const matchesMCQ = MCQFilter === 'all' || module.hasMCQ === MCQFilter;
        
        return matchesSearch && matchesSU && matchesGraded && matchesGroup && matchesGE && matchesMCQ;
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
    }, [searchQuery, MCQFilter, gradedFilter, SUFilter, groupFilter,GEFilter])
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
            <div className="filter-container">
            <label className="can-su">SU:</label>
            <select value={SUFilter} onChange = {(e) => setSUFilter(e.target.value)} className="filter-box">
                <option value='all'>All</option>
                <option value='True'>True</option>
                <option value='False'>False</option>
            </select>
            </div>

            <div className="filter-container">
            <label className="graded">Pass/Fail:</label>
            <select value={gradedFilter} onChange = {(e) => setGradedFilter(e.target.value)} className="filter-box">
                <option value='all'>All</option>
                <option value='True'>True</option>
                <option value='False'>False</option>
            </select>
            </div>

            <div className="filter-container">
            <label className="grp-projs">group projs:</label>
            <select value={groupFilter} onChange = {(e) => setGroupFilter(e.target.value)} className="filter-box">
                <option value='all'>All</option>
                <option value='True'>True</option>
                <option value='False'>False</option>
            </select>
            </div>

            <div className="filter-container">
            <label className="grp-projs">has MCQ:</label>
            <select value={MCQFilter} onChange = {(e) => setMCQFilter(e.target.value)} className="filter-box">
                <option value='all'>All</option>
                <option value='True'>True</option>
                <option value='False'>False</option>
            </select>
            </div>

            <div className="filter-container">
            <label className="grp-projs">GE pillar:</label>
            <select value={GEFilter} onChange = {(e) => setGEFilter(e.target.value)} className="filter-box">
                <option value='all'>All</option>
                <option value='NIL'>NIL</option>
                <option value='GEA'>GEA</option>
                <option value='GEC'>GEC</option>
                <option value='GEI'>GEI</option>
                <option value='GEN'>GEN</option>
                <option value='GESS'>GESS</option>
                <option value='GEX'>GEX</option>
            </select>
            </div>
            

            <ol className="modules-list">
                {currentModules.map((module) => (
                    <li>{module.value} | {module.canSU} |   {module.passFail} | {module.hasGroupProject} | {module.hasMCQ} |
                    {module.GEPillar} </li>
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