import React from 'react';
import {Typography, Box, Tabs, Tab} from '@mui/material';

const About: React.FC = () => {
    return (
        <Box sx={{p: 3}}>
            <Typography variant="h4">About Us</Typography>
            <Typography variant="body1" sx={{mt: 2}}>
                Herzlich willkommen auf der digitalen Genusswand – der spaßigsten und genussvollsten Art, kleine
                Alltagssünden im Büro zu feiern (oder zu büßen, je nach Perspektive). Hier wird aus jeder Panne, jedem
                Fauxpas und jeder leichtsinnigen Aktion eine Gelegenheit, das Team zum Schmunzeln und den Magen zum
                Freuen zu bringen.
            </Typography>
            <br/>
            <Typography variant="h5">
                Was ist die Genusswand?
            </Typography>
            <Typography variant="body1" sx={{mt: 2}}>
                Die Genusswand ist mehr als nur eine Sammlung von Strichen – sie ist ein Ort der Gemeinschaft, der
                Freude und des kollektiven Kalorienaufbaus. Früher zierten handgeschriebene Striche auf einer Tafel
                unsere Bürowand, doch das digitale Zeitalter hat auch hier Einzug gehalten. Jetzt ist die Genusswand
                online und bereit, jedes noch so kleine Missgeschick in ein Highlight des Tages zu verwandeln.

                Einen Kundentermin vergessen? Zack, ein Strich. Die Kaffeemaschine nicht entkalkt? Strich. Den
                legendären „Reply All“-Fehler begangen? Herzlichen Glückwunsch, auch das ist ein Strich! Doch keine
                Sorge – jeder Strich ist nicht das Ende, sondern der Anfang einer genussvollen Wiedergutmachung.
            </Typography>
            <br/>
            <Typography variant="h5">
                Wie funktioniert das Prinzip?
            </Typography>

            <Typography variant="body1" sx={{mt: 2}}>
                Die Regeln sind einfach:
                <br/>
                1. Verfehlung: Du machst einen kleinen Fehler – sei es ein verschütteter Kaffee, ein vergessener Termin
                oder ein besonders mieser Witz im Team-Meeting.
                <br/>
                2. Strich: Deine Verfehlung wird mit einem Strich auf der Genusswand „belohnt“.
                <br/>
                3. Abbau: Jeder Strich kann mit einem Genussmittel beglichen werden. Kuchen, Kekse, Muffins – der
                Fantasie
                sind keine Grenzen gesetzt. Hauptsache, es zaubert ein Lächeln auf die Gesichter deiner Kolleg*innen
                (und füllt den Pausenraum mit Kalorien).
            </Typography>

            <br/>
            <Typography variant="h5">
                Warum ist die Genusswand gut?
            </Typography>
            <Typography variant="body1" sx={{mt: 2}}>
                Die Genusswand ist nicht nur ein humorvolles Gimmick, sondern auch ein echter Teamplayer. Sie verwandelt
                kleine Fehler in süße Highlights und sorgt dafür, dass das Büroklima locker bleibt. Statt sich über
                Missgeschicke zu ärgern, freuen wir uns auf die nächste Leckerei.

                Sie fördert auch die Kreativität: Von selbstgebackenem Bananenbrot bis hin zu kunstvoll dekorierten
                Donuts – jede Wiedergutmachung ist ein kleines kulinarisches Kunstwerk. Außerdem fördert sie den
                Teamzusammenhalt: Nichts schweißt ein Team mehr zusammen als das gemeinsame Verspeisen eines
                Schokoladenkuchens.
            </Typography>

            <br/>

            <Typography variant="h5">
                Warum digital?
            </Typography>
            <Typography variant="body1" sx={{mt: 2}}>
                Weil wir gerne up to date sind und niemand mehr Lust hat, nach einem verschwundenen Kreidestift zu
                suchen. Unsere digitale Genusswand ist immer griffbereit, übersichtlich und – das Beste – anonymisiert
                die Verfehlungen auf Wunsch, um peinliche Momente in süße Erinnerungen zu verwandeln.
            </Typography>

            <br/>

            <Typography variant="h5">
                Der wahre Genuss
            </Typography>
            <Typography variant="body1" sx={{mt: 2}}>
                Die Genusswand ist nicht nur ein System, sondern ein Lebensgefühl. Sie zeigt uns, dass Fehler menschlich
                sind und dass man sie mit einem Lächeln und einem Stück Kuchen wieder gutmachen kann.

                Also, falls du dich fragst, warum es hier immer nach frisch gebackenem Apfelkuchen duftet oder warum im
                Pausenraum ein Kampf um das letzte Schoko-Croissant ausbricht – jetzt weißt du es.

                Wir laden dich ein, ein Teil dieses humorvollen Rituals zu sein. Sei bereit, Fehler zu machen, Striche
                zu sammeln und die Kunst des Genusses zu perfektionieren. Denn am Ende des Tages zählt nicht der Strich,
                sondern der Kuchen, der ihn tilgt.

                In diesem Sinne: Frohes Schlemmen und viel Spaß mit der Genusswand!
            </Typography>

        </Box>
    );
};

export default About;
