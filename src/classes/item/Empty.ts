import { Item } from '.';
import Tool from './Tool';

export default class Empty extends Tool {
    constructor() {
        super(-1, '', '', Item.Mode.SELECT, false);
    }
}
