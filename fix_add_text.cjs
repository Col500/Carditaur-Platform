const fs = require('fs');
let code = fs.readFileSync('src/components/AdminFlyers.tsx', 'utf8');

code = code.replace(/const addText = \(text: string, label: string\) => \{/, `const addText = (text: string, label: string, typography?: any) => {
    let fontFamily = 'Fredoka';
    let fill = '#ffffff';

    if (typography) {
        if (label === 'Headline') {
            fontFamily = typography.headlineFont || fontFamily;
            fill = typography.headlineColor || fill;
        } else {
            fontFamily = typography.bodyFont || fontFamily;
            fill = typography.bodyColor || fill;
        }
    }`);

code = code.replace(/fontFamily: 'Inter',/g, "fontFamily: fontFamily,");
code = code.replace(/fill: '#ffffff',/g, "fill: fill,");

code = code.replace(/<button onClick=\{\(\) => addText\(flyer.headline, 'Headline'\)\} /g, "<button onClick={() => addText(flyer.headline, 'Headline', flyer.typography)} ");
code = code.replace(/<button onClick=\{\(\) => addText\(flyer.bodyMessage, 'Body'\)\} /g, "<button onClick={() => addText(flyer.bodyMessage, 'Body', flyer.typography)} ");
code = code.replace(/<button onClick=\{\(\) => addText\(flyer.signOff, 'Sign-off'\)\} /g, "<button onClick={() => addText(flyer.signOff, 'Sign-off', flyer.typography)} ");
code = code.replace(/<button onClick=\{\(\) => addText\(flyer.contactInfo, 'Contact'\)\} /g, "<button onClick={() => addText(flyer.contactInfo, 'Contact', flyer.typography)} ");

fs.writeFileSync('src/components/AdminFlyers.tsx', code);
