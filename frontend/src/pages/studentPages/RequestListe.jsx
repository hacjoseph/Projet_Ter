import React, { useEffect, useState } from "react";
import api from "../../api/axios";

function MyChangeRequests() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        api.get("change-requests/").then((res) => setRequests(res.data));
    }, []);

    return (
        <div>
            <h2>Mes demandes</h2>
            <ul>
                {requests.map((req) => (
                    <li key={req.id}>
                        Pour projet: {req.desired_project || "Non spécifié"} – équipe: {req.desired_team || "Non spécifiée"}
                        → <strong>{req.status}</strong>
                    </li>
                ))}
            </ul>
        </div>
    );
}