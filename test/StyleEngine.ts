import { setup, tw } from "twind";
import { virtualSheet } from "twind/sheets";

const sheet = virtualSheet();


setup({
    sheet
});


const style1 = tw`bg-blue-500 text-white p-4 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300`;
const style2 = tw`bg-green-500 text-white p-4 rounded-lg shadow-lg hover:bg-green-700 transition duration-300`;

console.log("Generated CSS:");
console.log(sheet.target);

// You can now use `style1` and `style2` as class names in your elements
console.log("Style 1 class:", style1);
console.log("Style 2 class:", style2);