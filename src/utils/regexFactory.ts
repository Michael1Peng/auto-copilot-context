import { marksConfig } from "../config";
import { getLanguageComment } from "./languageCommentMap";

interface GetRegexReturn {
  copilotContextRegex: RegExp;
  copilotContextBlockRegex: RegExp;
  copilotContextRegexGlobal: RegExp;
  copilotContextAllRegex: RegExp;
  commentBlockRegex: RegExp;
  commentBlockRegexWithLineBreak: RegExp;
  blockCommentStartRegex: RegExp;
  blockCommentEndRegex: RegExp;
  lineCommentRegex: RegExp;
}

export function getRegex(languageId = 'javascript'): GetRegexReturn {
  const { chunkStart, chunkEnd, copilotContext, copilotContextAll } = marksConfig.getMarksConfig();
  const { line, blockStart, blockEnd } = getLanguageComment(languageId);

  const copilotContextRegex = new RegExp(`${line} ${copilotContext}\r?\n`, 'g');
  const copilotContextBlockRegex = new RegExp(`${line} ${copilotContext}([\\s\\S]*?)${line} ${copilotContext}`);
  const copilotContextRegexGlobal = new RegExp(`${line} ${copilotContext}([\\s\\S]*?)${line} ${copilotContext}`, 'g');
  const copilotContextAllRegex = new RegExp(`${line} ${copilotContextAll}\r?\n`, 'g');
  const commentBlockRegex = new RegExp(`${line} ${chunkStart}[\\s\\S]*?${line} ${chunkEnd}\r?\n`, 'g');
  const commentBlockRegexWithLineBreak = new RegExp(`${line} ${chunkStart}[\\s\\S]*?${line} ${chunkEnd}\r?\n\r?\n?`, 'g');
  const blockCommentStartRegex = new RegExp(`${blockStart}`, 'g');
  const blockCommentEndRegex = new RegExp(`${blockEnd}`, 'g');
  const lineCommentRegex = new RegExp(`${line}.*$`, 'gm');

  return {
    copilotContextRegex,
    copilotContextBlockRegex,
    copilotContextRegexGlobal,
    copilotContextAllRegex,
    commentBlockRegex,
    commentBlockRegexWithLineBreak,
    blockCommentStartRegex,
    blockCommentEndRegex,
    lineCommentRegex,
  }
}
