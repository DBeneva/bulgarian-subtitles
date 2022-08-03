const subtitleEditor = document.getElementById('subtitle-editor');
const loadBtn = document.getElementById('load-btn');
const prepareSubsBtn = document.getElementById('prepare-subs-btn');
const removeTitleBtn = document.getElementById('remove-title');
const addTimingBtn = document.getElementById('add-timing');

subtitleEditor.addEventListener('input', enablePrepareSubtitles);
loadBtn.addEventListener('click', loadScript);
prepareSubsBtn.addEventListener('click', prepareSubtitles);
removeTitleBtn.addEventListener('click', removeTitle);
addTimingBtn.addEventListener('click', addTiming);

function enablePrepareSubtitles() {
    if (subtitleEditor.value != '') {
        prepareSubsBtn.removeAttribute('disabled');
    }
}

async function loadScript() {
    const script = await getScript();
    subtitleEditor.value = script;

    loadBtn.setAttribute('disabled', 'disabled');
}

function prepareSubtitles() {
    const script = subtitleEditor.value;
    const cleanedUpScript = cleanUpScript(script);
    const subtitles = makeEachSentenceOnNewLine(cleanedUpScript);

    subtitleEditor.value = subtitles;

    prepareSubsBtn.setAttribute('disabled', 'disabled');
    removeTitleBtn.removeAttribute('disabled');
    addTimingBtn.removeAttribute('disabled');
}

async function getScript() {
    try {
        const response = await fetch('http://localhost:3000');
        return await response.json();
    } catch (err) {
        console.error(err);
    }
}

function cleanUpScript(script) {
    let cleanedUpScript = removeComments(script);
    cleanedUpScript = formatCenturies(cleanedUpScript);
    cleanedUpScript = removeSpacesAndEmoticons(cleanedUpScript);

    return cleanedUpScript;
}

function removeComments(script) {
    return script.includes('[a]')
        ? script.slice(0, script.lastIndexOf('[a]')).replace(/\[([a-z])+\]/g, '')
        : script;
}

function formatCenturies(script) {
    let formattedScript = script.replace(/ I в.| I век| 1-ви в.| 1-ви век/g, ' 1. век');
    formattedScript = formattedScript.replace(/ II в.| II век| 2-ри в.| 2-ри век/g, ' 2. век');
    formattedScript = formattedScript.replace(/ III в.| III век| 3-ти в.| 3-ти век/g, ' 3. век');
    formattedScript = formattedScript.replace(/ IV в.| IV век| 4-ти в.| 4-ти век/g, ' 4. век');
    formattedScript = formattedScript.replace(/ V в.| V век| 5-ти в.| 5-ти век/g, ' 5. век');
    formattedScript = formattedScript.replace(/ VI в.| VI век| 6-ти в.| 6-ти век/g, ' 6. век');
    formattedScript = formattedScript.replace(/ VII в.| VII век| 7-ми в.| 7-ми век/g, ' 7. век');
    formattedScript = formattedScript.replace(/ VIII в.| VIII век| 8-ми в.| 8-ми век/g, ' 8. век');
    formattedScript = formattedScript.replace(/ IX в.| IX век| 9-ти в.| 9-ти век/g, ' 9. век');
    formattedScript = formattedScript.replace(/ X в.| X век| 10-ти в.| 10-ти век/g, ' 10. век');
    formattedScript = formattedScript.replace(/ XI в.| XI век| 11-ти в.| 11-ти век/g, ' 11. век');
    formattedScript = formattedScript.replace(/ XII в.| XII век| 12-ти в.| 12-ти век/g, ' 12. век');
    formattedScript = formattedScript.replace(/ XIII в.| XIII век| 13-ти в.| 13-ти век/g, ' 13. век');
    formattedScript = formattedScript.replace(/ XIV в.| XIV век| 14-ти в.| 14-ти век/g, ' 14. век');
    formattedScript = formattedScript.replace(/ XV в.| XV век| 15-ти в.| 15-ти век/g, ' 15. век');
    formattedScript = formattedScript.replace(/ XVI в.| XVI век| 16-ти в.| 16-ти век/g, ' 16. век');
    formattedScript = formattedScript.replace(/ XVII в.| XVII век| 17-ти в.| 17-ти век/g, ' 17. век');
    formattedScript = formattedScript.replace(/ XVIII в.| XVIII век| 18-ти в.| 18-ти век/g, ' 18. век');
    formattedScript = formattedScript.replace(/ XIX в.| XIX век| 19-ти в.| 19-ти век/g, ' 19. век');
    formattedScript = formattedScript.replace(/ XX в.| XX век| 20-ти в.| 20-ти век/g, ' 20. век');
    formattedScript = formattedScript.replace(/ XXI в.| XXI век| 21-ви в.| 21-ви век/g, ' 21. век');

    return formattedScript;
}

function removeSpacesAndEmoticons(script) {
    const pattern = /^ | (?= )|\n|\r|☺/;
    let textOnlyScript = script;

    while (pattern.test(textOnlyScript)) {
        textOnlyScript = textOnlyScript.replace(pattern, '');
    }

    return textOnlyScript;
}

function makeEachSentenceOnNewLine(script) {
    const pattern = /(?<! Уча)(?<! р)(?<! гр)(?<! о)(?<! г)(?<! хил)(?<![1-9])(?<! пр)(?<! н)(?<! т)(?<![ (]дн)([\.?!]) *(?=[А-Я])/g;
    return script.replace(pattern, '$1\n\r');
}

function removeTitle() {
    const subtitles = subtitleEditor.value;
    subtitleEditor.value = subtitles.replace(/^.*\n\n/, '');

    removeTitleBtn.setAttribute('disabled', 'disabled');
}

async function addTiming() {
    addTimingToSubtitleEditor();
    await createVTTFile();
}

function addTimingToSubtitleEditor() {
    const subtitles = subtitleEditor.value;
    const subtitlesWithTiming = `WEBVTT\n\n${subtitles}`.replace(/\n\n/g, '\n\n99:59:59.999 --> 99:59:59.999\n');

    subtitleEditor.value = subtitlesWithTiming;
}

async function createVTTFile() {
    try {
        await fetch('http://localhost:3000/vtt', {
            method: 'post',
            headers: {
                ['Content-Type']: 'application/json'
            },
            body: JSON.stringify({ subtitles: subtitleEditor.value })
        });
    } catch (err) {
        console.error(err);
    }
}