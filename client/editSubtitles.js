const subtitleEditor = document.getElementById('subtitle-editor');
const loadScriptBtn = document.getElementById('load-btn');
const prepareSubsBtn = document.getElementById('prepare-subs-btn');
const cleanUpBtn = document.getElementById('clean-up-btn');
const saveBtn = document.getElementById('save-btn');
const addTimingBtn = document.getElementById('add-timing');

subtitleEditor.addEventListener('input', enablePrepareSubtitles);
loadScriptBtn.addEventListener('click', loadScript);
prepareSubsBtn.addEventListener('click', prepareSubtitles);
cleanUpBtn.addEventListener('click', cleanUpSubtitleEditor);
saveBtn.addEventListener('click', saveTxTFile);
addTimingBtn.addEventListener('click', addTiming);

function enablePrepareSubtitles() {
    if (subtitleEditor.value != '') {
        loadScriptBtn.style.display = 'none';
        subtitleEditor.style.color = 'initial';

        prepareSubsBtn.removeAttribute('disabled');
        cleanUpBtn.style.display = 'inline-block';
        saveBtn.style.display = 'inline-block';
        cleanUpBtn.removeAttribute('disabled');
        saveBtn.removeAttribute('disabled');
        addTimingBtn.removeAttribute('disabled');
    }
}

function cleanUpSubtitleEditor() {
    subtitleEditor.value = '';

    loadScriptBtn.style.display = 'inline-block';
    loadScriptBtn.removeAttribute('disabled');
    prepareSubsBtn.setAttribute('disabled', 'disabled');
    cleanUpBtn.setAttribute('disabled', 'disabled');
    addTimingBtn.setAttribute('disabled', 'disabled');
}

async function loadScript() {
    const script = await getScript();
    subtitleEditor.value = script;

    if (!script.startsWith('ENOENT')) {
        loadScriptBtn.setAttribute('disabled', 'disabled');
        prepareSubsBtn.removeAttribute('disabled');
    } else {
        subtitleEditor.value = 'Не е намерен документ с разширение .txt';
        subtitleEditor.style.color = 'red';
    }
}

function prepareSubtitles() {
    const script = subtitleEditor.value;
    const cleanedUpScript = cleanUpScript(script);
    const subtitles = makeEachSentenceOnNewLine(cleanedUpScript);

    subtitleEditor.value = subtitles;

    loadScriptBtn.style.display = 'none';
    prepareSubsBtn.setAttribute('disabled', 'disabled');
    cleanUpBtn.removeAttribute('disabled');
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
    let cleanedUpScript = removeSpacesAndNewLines(script);
    cleanedUpScript = removeComments(cleanedUpScript);
    cleanedUpScript = removeEmoticons(cleanedUpScript);
    cleanedUpScript = removeLinks(cleanedUpScript);
    cleanedUpScript = formatCenturies(cleanedUpScript);
    cleanedUpScript = fixDashesAndHyphens(cleanedUpScript);
    cleanedUpScript = fixEllipsis(cleanedUpScript);
    cleanedUpScript = fixSpacesBeforePunctuationMarks(cleanedUpScript);
    cleanedUpScript = fixQuotationMarks(cleanedUpScript);
    cleanedUpScript = fixSoCalled(cleanedUpScript);
    cleanedUpScript = fixFemininePersonalPronoun(cleanedUpScript);
    cleanedUpScript = fixBrandNames(cleanedUpScript);
    cleanedUpScript = fixXAndY(cleanedUpScript);

    return cleanedUpScript;
}

function removeComments(script) {
    return script.includes('[a]')
        ? script.slice(0, script.lastIndexOf('[a]')).replace(/\[([a-z])+\]/g, '')
        : script;
}

function removeSpacesAndNewLines(script) {
    const pattern = /^ | (?=[ \n\r\t])|\n|\r|\t| $/;
    let textOnlyScript = script;

    while (pattern.test(textOnlyScript)) {
        textOnlyScript = textOnlyScript.replace(pattern, '');
    }

    return textOnlyScript;
}

function removeEmoticons(script) {
    return script.replace(/☺/g, '');
}

function removeLinks(script) {
    return script.replace(/http.*?(?=[а-яА-Я]|\n)/g, '');
}

function formatCenturies(script) {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
    const patternRoman = / ([IVX]+|[ХI]+)(-ти|-ми|-ри)? (в\.|век)/g;
    const patternArabic = / ([0-9]+)(-ти|-ми|-ри)* (в\.|век)/g;

    return script
        .replace(patternRoman, (_, roman) => ` ${romanNumerals.findIndex(v => v == roman.replace(/Х/g, 'X')) + 1}. век`)
        .replace(patternArabic, ' $1. век');
}

function removeCommentsInBrackets(script) {
    return script.replace(/\(.*?\)/, '');
}

function fixDashesAndHyphens(script) {
    return script
        .replace(/\–/g, '-')
        .replace(/ \- | \-|\- /g, ' – ')
        .replace(/(?<=\D )– (\d)/g, '-$1')
        .replace(/([0-9]+)\-([0-9]+)/, '$1 \– $2')
        .replace(/( по| най|[ \n]По|[ \n]Най) \– /g, '$1-');
}

function fixEllipsis(script) {
    return script.replace(/…/g, '...');
}

function fixSpacesBeforePunctuationMarks(script) {
    return script.replace(/ (\.|\,|\?|\!)/g, '$1');
}

function fixQuotationMarks(script) {
    return script.includes('”') ? script.replace(/“(.+?)”/g, '„$1“') : script;
}

function fixSoCalled(script) {
    return script.replace(/т\.нар /g, 'т.нар. ');
}

function fixFemininePersonalPronoun(script) {
    return script.replace(/ й([ \.\,])/g, ' ѝ$1');
}

function fixBrandNames(script) {
    return script
        .replace(/Уча се/g, 'Уча.се')
        .replace(/ Scratch| Скрач| „Скрач“/g, ' **Scratch**');
}

function fixXAndY(script) {
    return script.replace(/ (X|Х|Y|x|х|y)(?=[ \.\,])/g, (_, xOrY) => ` **${xOrY.replace('Х', 'X').toLowerCase()}**`);
}

function makeEachSentenceOnNewLine(script) {
    const pattern = /(?<! Уча)(?<! р)(?<! гр)(?<! о)(?<! г)(?<! хил)(?<![1-9])(?<! пр)(?<! н)(?<! т.е)(?<! т.нар)(?<![ (]дн)([\.?!]) *(?=[А-Я])/g;
    return script.replace(pattern, '$1\n\r');
}

function removeExclamationMarks(subtitles) {
    return subtitles.replace(/\!/g, '.');
}

async function saveTxTFile() {
    try {
        await fetch('http://localhost:3000', {
            method: 'post',
            headers: {
                ['Content-Type']: 'application/json'
            },
            body: JSON.stringify({ subtitles: subtitleEditor.value })
        });

        saveBtn.setAttribute('disabled', 'disabled');
    } catch (err) {
        console.error(err);
    }
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