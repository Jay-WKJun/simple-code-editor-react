import React, {
  useCallback,
  useRef,
  useState,
  useMemo,
} from 'react';
import { ThemeProvider } from 'styled-components';
import { highlight, languages } from 'prismjs/prism';
import './languages';

import themes from './themes';
import History from './History';
import TextAreaEditor from './TextAreaEditor';
import {
  Pre,
  Wrapper,
  TextArea,
} from './styles';

type themeList = keyof typeof themes;
type lang =
  | 'typescript' | 'javascript' | 'java' | 'python' | 'rust'
  | 'ruby' | 'swift' | 'r' | 'c' | 'cpp' | 'csharp'
  | 'cobol' | 'kotlin' | 'haskell' | 'arduino' | 'coffeescript'
  | 'clojure' | 'dart' | 'yaml' | 'markdown' | 'markup'
  | 'docker' | 'graphql' | 'json' | 'css' | 'sass' | 'scss';

interface CodeEditorProps {
  indent?: number
  mode?: themeList
  language?: lang
}

function CodeEditor({ indent = 2, mode = 'dark', language = 'javascript' }: CodeEditorProps) {
  const [value, setValue] = useState('');

	const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const theme = useMemo(() => themes[mode], [mode]);

	const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.currentTarget.value);
    History.push(e.currentTarget.value);

    const textAreaElement = textAreaRef.current;
		if (textAreaElement) {
			textAreaElement.style.height = `${textAreaElement.scrollHeight}px`;
		}
	}, [textAreaRef]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const {
      selectionEnd: caretEnd,
      selectionStart: caretStart,
      value: val,
    } = e.currentTarget;
    const textAreaEditor = new TextAreaEditor(
      e.currentTarget,
      val,
      caretStart,
      caretEnd,
      indent,
    );

    function setNewText(
      newText: string,
    ) {
      setValue(newText);
      History.push(newText);
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      setNewText(textAreaEditor.executeEnterAction());
      return;
    }

    if (e.key === ' ') {
      e.preventDefault();
      setNewText(textAreaEditor.executeSpaceAction());
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      setNewText(textAreaEditor.executeTabAction());
      return;
    }

    if (/[} | ) | \] | > | ' | " | `]/.test(e.key)) {
      if (textAreaEditor.isParenthesisPaired(e.key)) {
        e.preventDefault();
        textAreaEditor.executeBracketCloseAction();
        return;
      }
    }

    if (/[{ | ( | [ | < | ' | " | `]/.test(e.key)) {
      e.preventDefault();
      setNewText(textAreaEditor.executeBracketOpenAction(e.key));
      return;
    }

    if (e.ctrlKey && e.key.toLocaleLowerCase() === 'z') {
      let newText = '';

      if (e.shiftKey) newText = History.goForward();
      else newText = History.goBack();

      const newCaretPosition = newText.length;
      textAreaEditor.setNewText(newText, newCaretPosition, newCaretPosition);
      setValue(newText);
    }
  }, [indent]);

  return (
    <ThemeProvider theme={theme}>
      <Wrapper>
        <TextArea
          autoCapitalize="none"
          autoComplete="off"
          autoFocus={false}
          spellCheck={false}
          ref={textAreaRef}
          value={value}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
        />
        { /* @ts-ignore */ }
        <Pre dangerouslySetInnerHTML={{ __html: highlight(
            value,
            /* @ts-ignore */
            languages[language],
            language,
          )}}
        />
      </Wrapper>
    </ThemeProvider>
  );
}

export default CodeEditor;
