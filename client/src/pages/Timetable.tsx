import React from "react";
import { TimetableComponent } from "../components/Timetable-component";

export default function Timetable() {
    return (
        <>
            <div className="mid-section">
                <h1 className="mid-section-title">Timetable</h1>
                <p className="mid-section-content">
                Plan your timetable with friends
                </p>
            </div>
            <TimetableComponent/>
        </>
    )
}