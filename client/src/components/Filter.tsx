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

    const allRawModules = [Modules, GEN, CD, ID, GEI, GEA, GEX, GEC, GESS].flat();
    const preferredPillars = ['GEA', 'GEC', 'GEI', 'GEN', 'GESS', 'GEX'];

    const allModules = Array.from(
    new Map(
        [...allRawModules]
        .sort((a, b) => {
            const aPreferred = preferredPillars.includes(a.GEPillar);
            const bPreferred = preferredPillars.includes(b.GEPillar);
            return Number(aPreferred) - Number(bPreferred);
        })
        .map((mod) => [mod.value, mod])
    ).values()
    );

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
            className = "mod-search-box"
            type="text"
            placeholder='Search for a module...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
            </div>
            <div className="filter-container">
            <label className="can-su">Can S/U:</label>
            <select value={SUFilter} onChange = {(e) => setSUFilter(e.target.value)} className="filter-box">
                <option value='all'>All</option>
                <option value='True'>Yes</option>
                <option value='False'>No</option>
            </select>
            </div>

            <div className="filter-container">
            <label className="graded">Grading Basis:</label>
            <select value={gradedFilter} onChange = {(e) => setGradedFilter(e.target.value)} className="filter-box">
                <option value='all'>All</option>
                <option value='True'>Pass/Fail</option>
                <option value='False'>Graded</option>
            </select>
            </div>

            <div className="filter-container">
            <label className="grp-projs">Assessments:</label>
            <select value={groupFilter} onChange = {(e) => setGroupFilter(e.target.value)} className="filter-box">
                <option value='all'>All</option>
                <option value='True'>Group</option>
                <option value='False'>Individual</option>
            </select>
            </div>

            <div className="filter-container">
            <label className="grp-projs">Exam Format:</label>
            <select value={MCQFilter} onChange = {(e) => setMCQFilter(e.target.value)} className="filter-box">
                <option value='all'>All</option>
                <option value='True'>MCQ</option>
                <option value='False'>Open-ended</option>
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
            
            <div className="module-card-list">
                {currentModules.map((module) => (
                <div key={module.value} className="module-card horizontal">
                    <div className="module-main">
                        <div className = "module-header">
                            <h3>{module.value}</h3>
                            <a href= {`https://nusmods.com/courses/${module.value}`} target="_blank" rel="noopener noreferrer">
                            More information </a>
                        </div>
                        <p className="module-desc">{module.desc}</p>
                    </div>
                    <div className="module-meta">
                        <p><strong>Can SU:</strong> {module.canSU}</p>
                        <p><strong>Pass/Fail:</strong> {module.passFail}</p>
                        <p><strong>Group Project:</strong> {module.hasGroupProject}</p>
                        <p><strong>MCQ:</strong> {module.hasMCQ}</p>
                         <p><strong>GE Pillar:</strong> {module.GEPillar}</p>
                    </div>
                </div>
                 ))}
            </div>

            <div className="pagination">
          <button className="search-navigate" onClick={handlePrev} disabled={currentPage === 1}>Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button className="search-navigate" onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
            </div>
        </div>
        </>
    )
}