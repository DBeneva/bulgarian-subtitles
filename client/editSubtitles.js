const subtitleEditor = document.getElementById('subtitle-editor');
const loadScriptBtn = document.getElementById('load-btn');
const prepareSubsBtn = document.getElementById('prepare-subs-btn');
const cleanUpBtn = document.getElementById('clean-up-btn');
const removeTitleBtn = document.getElementById('remove-title-btn');
const addTimingBtn = document.getElementById('add-timing');

subtitleEditor.addEventListener('input', enablePrepareSubtitles);
loadScriptBtn.addEventListener('click', loadScript);
prepareSubsBtn.addEventListener('click', prepareSubtitles);
cleanUpBtn.addEventListener('click', cleanUpSubtitleEditor);
removeTitleBtn.addEventListener('click', removeTitle);
addTimingBtn.addEventListener('click', addTiming);

function enablePrepareSubtitles() {
    if (subtitleEditor.value != '') {
        loadScriptBtn.style.display = 'none';
        subtitleEditor.style.color = 'initial';

        prepareSubsBtn.removeAttribute('disabled');
        cleanUpBtn.style.display = 'inline-block';
        cleanUpBtn.removeAttribute('disabled');
        addTimingBtn.removeAttribute('disabled');
    }
}

function cleanUpSubtitleEditor() {
    subtitleEditor.value = '';

    loadScriptBtn.style.display = 'inline-block';
    loadScriptBtn.removeAttribute('disabled');
    prepareSubsBtn.setAttribute('disabled', 'disabled');
    cleanUpBtn.setAttribute('disabled', 'disabled');
    removeTitleBtn.style.display = 'none';
    addTimingBtn.setAttribute('disabled', 'disabled');
}

async function loadScript() {
    const script = await getScript();
    subtitleEditor.value = script;
    console.log(script);

    if (!script.startsWith('ENOENT')) {
        loadScriptBtn.setAttribute('disabled', 'disabled');
        prepareSubsBtn.removeAttribute('disabled');
        removeTitleBtn.removeAttribute('disabled');
    } else {
        subtitleEditor.value = 'Не е намерен документ с разширение .txt';
        subtitleEditor.style.color = 'red';
    }
}

function prepareSubtitles() {
    const script = subtitleEditor.value;
    const title = script.includes('\n') ? script.slice(0, script.indexOf('\n')) : '';
    const cleanedUpScript = cleanUpScript(script.slice(script.indexOf('\n') + 1));
    const subtitles = makeEachSentenceOnNewLine(cleanedUpScript);

    subtitleEditor.value = title ? `${title}\n\r${subtitles}` : subtitles;

    loadScriptBtn.setAttribute('disabled', 'disabled');
    prepareSubsBtn.setAttribute('disabled', 'disabled');
    cleanUpBtn.removeAttribute('disabled');

    if (title) {
        removeTitleBtn.style.display = 'inline-block';
        removeTitleBtn.removeAttribute('disabled');
    }

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
    cleanedUpScript = fixDashesAndHyphens(cleanedUpScript);
    cleanedUpScript = fixUchaSe(cleanedUpScript);

    return cleanedUpScript;
}

function removeComments(script) {
    return script.includes('[a]')
        ? script.slice(0, script.lastIndexOf('[a]')).replace(/\[([a-z])+\]/g, '')
        : script;
}

function formatCenturies(script) {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
    const patternRoman = / ([IVX]+|[ХI]+)(-ти|-ми|-ри)? (в\.|век)/g;
    const patternArabic = / ([0-9]+)(-ти|-ми|-ри)* (в\.|век)/g;

    return script
        .replace(patternRoman, (_, roman) => ` ${romanNumerals.findIndex(v => v == roman.replace(/Х/g, 'X')) + 1}. век`)
        .replace(patternArabic, ' $1. век');
}

function removeSpacesAndEmoticons(script) {
    const pattern = /^ | (?= )|\n|\r|\t|☺| $/;
    let textOnlyScript = script;

    while (pattern.test(textOnlyScript)) {
        textOnlyScript = textOnlyScript.replace(pattern, '');
    }

    return textOnlyScript;
}

function fixDashesAndHyphens(script) {
    return script
        .replace(/\–/g, '-')
        .replace(/ \- | \-|\- /g, ' – ')
        .replace(/([0-9]+)\-([0-9]+)/, '$1 \– $2')
        .replace(/( по| най) \– /g, '$1-');
}

function fixUchaSe(script) {
    return script.replace(/Уча се/g, 'Уча.се');
}

function makeEachSentenceOnNewLine(script) {
    const pattern = /(?<! Уча)(?<! р)(?<! гр)(?<! о)(?<! г)(?<! хил)(?<![1-9])(?<! пр)(?<! н)(?<! т.е)(?<! т.нар)(?<![ (]дн)([\.?!]) *(?=[А-Я])/g;
    return script.replace(pattern, '$1\n\r');
}

function removeTitle() {
    const subtitles = subtitleEditor.value;
    subtitleEditor.value = subtitles.replace(/^.*\n\n/, '');

    removeTitleBtn.setAttribute('disabled', 'disabled');
}

async function addTiming() {
    addTimingBtn.setAttribute('disabled', 'disabled');

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