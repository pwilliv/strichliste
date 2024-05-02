var barn = new Barn(localStorage);
const queueKey = "requestQueue";
const reloadEvery = "300"; // reload timeout in seconds
var psk = barn.get("psk");
// if (psk === null) {
//     psk = "";
//     barn.set("psk", "");
// }
var ready = true;

// async function sign(url) {
//     try {
//         // Herausforderung vom Server abrufen
//         const challengeResponse = await fetch('challenge');
//         const challenge = await challengeResponse.text();
        
//         // URL signieren
//         const signature = sha512(url + challenge + psk);
//         return url + "/" + signature;
//     } catch (error) {
//         console.error('Fehler beim Signieren der URL:', error);
//         // Hier könnten weitere Maßnahmen ergriffen werden, z.B. eine Fehlermeldung anzeigen
//         return null;
//     }
// }


async function commitRequests() {
    try {
        if (ready && barn.llen(queueKey) > 0) {
            ready = false; // Nur eine Anfrage gleichzeitig
            const url = barn.lrange(queueKey, 0, 0)[0];
            
            // AJAX-Anfrage senden
            const response = await $.ajax({
                url: url,
                method: 'GET', // oder 'POST', 'PUT', etc., je nach Anforderung
                // Hier können weitere Optionen für die AJAX-Anfrage hinzugefügt werden
            });
            
            // Anfrage erfolgreich abgeschlossen
            barn.lpop(queueKey);
        }
        
        // Überprüfen, ob das Queue noch Anfragen enthält
        if (barn.llen(queueKey) > 0) {
            document.getElementById("network_problem").style.visibility = "visible";
        } else {
            document.getElementById("network_problem").style.visibility = "hidden";
        }
    } catch (error) {
        console.error('Fehler beim Ausführen der Anfrage:', error);
        // Hier könnten weitere Maßnahmen ergriffen werden, z.B. eine Fehlermeldung anzeigen
    } finally {
        // Bereit für die nächste Anfrage
        ready = true;
    }
    
    // Die Funktion periodisch erneut aufrufen
    setTimeout(commitRequests, 100);
}



async function reloadWhenOnline() {
    try {
        // Anfrage an den Server senden, um die Online-Verfügbarkeit zu überprüfen
        const response = await fetch('/', { method: 'HEAD' });
        
        // Auf Antwort warten
        if (response.ok) {
            // Wenn die Seite erreichbar ist, Seite neu laden
            location.reload();
        }
    } catch (error) {
        console.error('Fehler beim Überprüfen der Online-Verfügbarkeit:', error.message);
        // Hier könnten weitere Maßnahmen ergriffen werden, z.B. eine Fehlermeldung anzeigen
    } finally {
        // Die Funktion periodisch erneut aufrufen
        setTimeout(reloadWhenOnline, 2000);
    }
}


$(function(){
    commitRequests(); // Starten des Commit-Handlers
    
    // Periodisch die Seite neu laden, wenn eine Internetverbindung vorhanden ist
    setInterval(function() {
        if (navigator.onLine) {
            location.reload();
        }
    }, reloadEvery * 1000);
});


async function book(human_id, category_id, amount, increment_button = true) {
    try {
        if (increment_button) {
            // Lokal den Zähler erhöhen
            const id = `sp-${human_id}%${category_id}`;
            const span = document.getElementById(id);
            if (span) {
                span.textContent = Number(span.textContent) + amount;
            } else {
                throw new Error('Das Element wurde nicht gefunden.');
            }
        }
        
        // URL für die Transaktion erstellen
        const url = `/add_transaction/${human_id}/${category_id}/${amount}`;
        
        // Anfrage an den Server senden
        const response = await fetch(url, {
            method: 'POST', // oder 'GET', 'PUT', etc.
            headers: {
                'Content-Type': 'application/json'
                // Hier können weitere Header hinzugefügt werden, falls benötigt
            },
            // body: JSON.stringify(data) // Hier können Daten mitgeschickt werden, falls benötigt
        });

        // Auf Antwort warten und Fehler behandeln
        if (!response.ok) {
            throw new Error('Fehler beim Hinzufügen der Transaktion.');
        }
        
        // Erfolgreiche Buchung
        console.log('Transaktion erfolgreich hinzugefügt.');
    } catch (error) {
        console.error('Fehler beim Buchen:', error.message);
        // Hier könnten weitere Maßnahmen ergriffen werden, z.B. eine Fehlermeldung anzeigen
    }
}

// function book(human_id, category_id, amount, increment_button) {
//     if (typeof increment_button === "undefined") {
//         increment_button = true
//     }

//     if (increment_button) {
//         //increment button locally
//         var id = "sp-" + human_id + "%" + category_id;
//         var span = document.getElementById(id);
//         span.textContent = Number(span.textContent) + amount;
//     }

//     var url = "/add_transaction/" + human_id + "/" + category_id + "/" + String(amount);
//     barn.rpush(queueKey, url);
// }

async function undo() {
    try {
        // URL für die Rückgängigmachung erstellen
        const url = '/undo';

        // Anfrage an den Server senden
        const response = await fetch(url, {
            method: 'POST', // oder 'GET', 'PUT', etc.
            headers: {
                'Content-Type': 'application/json'
                // Hier können weitere Header hinzugefügt werden, falls benötigt
            },
            // body: JSON.stringify(data) // Hier können Daten mitgeschickt werden, falls benötigt
        });

        // Auf Antwort warten und Fehler behandeln
        if (!response.ok) {
            throw new Error('Fehler beim Rückgängigmachen.');
        }
        
        // Seite neu laden, wenn das Rückgängigmachen erfolgreich war
        location.reload();
    } catch (error) {
        console.error('Fehler beim Rückgängigmachen:', error.message);
        // Hier könnten weitere Maßnahmen ergriffen werden, z.B. eine Fehlermeldung anzeigen
    }
}

// function undo() {
//     $.ajax(sign("undo"))
//         .done(function () {
//             location.reload();
//         })
//         .fail(function () {
//             alert("Error. Couldn't undo");
//         })
// }

// function batch_order(human_id, category_id) {
//     BootstrapDialog.show({
//         title: 'Kastengröße wählen',
//         // message: 'Click buttons below.',
//         buttons: [{
//             label: '24 (Rothaus)',
//             action: function () {
//                 book(human_id, category_id, 24);
//                 BootstrapDialog.closeAll()
//             }
//         }, {
//             label: '20 (Ötti/Flens)',
//             action: function () {
//                 book(human_id, category_id, 20);
//                 BootstrapDialog.closeAll()
//             }
//         }, {
//             label: '12 (Wasser)',
//             action: function () {
//                 book(human_id, category_id, 6);
//                 BootstrapDialog.closeAll()
//             }
//         }]
//     });
// }

function addUserDialog() {
    const myModal = new bootstrap.Modal(document.getElementById('newUserDialog'))
    myModal.show();
}

async function addUser() {
    try {
        // Den Wert des neuen Benutzernamens erhalten
        const newUserName = document.getElementById("newUserName").value;
        
        // URL für die Benutzerhinzufügung erstellen
        const url = `/add_user/${newUserName}`;
        
        // Anfrage an den Server senden
        const response = await fetch(url, {
            method: 'POST', // oder 'GET', 'PUT', etc.
            headers: {
                'Content-Type': 'application/json'
                // Hier können weitere Header hinzugefügt werden, falls benötigt
            },
            // body: JSON.stringify(data) // Hier können Daten mitgeschickt werden, falls benötigt
        });

        // Auf Antwort warten und Fehler behandeln
        if (!response.ok) {
            throw new Error('Fehler beim Hinzufügen des Benutzers.');
        }
        
        // Seite neu laden, wenn die Benutzerhinzufügung erfolgreich war
        location.reload();
    } catch (error) {
        console.error('Fehler beim Hinzufügen des Benutzers:', error.message);
        // Hier könnten weitere Maßnahmen ergriffen werden, z.B. eine Fehlermeldung anzeigen
    }
}

// function addUser() {
//     var url = ("add_user/" + document.getElementById("newUserName").value);
//     var jqxhr = $.ajax(sign(url))
//         .done(function () {
//             location.reload();
//         })
// }