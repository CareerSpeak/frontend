import React from 'react';
import { View } from 'react-native';
import { useTheme, IconButton, Text, Divider, Surface } from 'react-native-paper';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../App';
import { fetchQuestions, QuestionsResult, TranscriberResult } from '../DataFetcher';
import { useAccessToken } from '../AccessTokenProvider';
import { startRecording, stopRecording } from '../Microphone';

type TechnicalInterviewerScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TechnicalInterviewer'
>;

type TechnicalInterviewerScreenRouteProp = RouteProp<
  RootStackParamList,
  'TechnicalInterviewer'
>;

type Props = {
  route: TechnicalInterviewerScreenRouteProp;
  navigation: TechnicalInterviewerScreenNavigationProp;
};

type QuestionDetails = {
  question: string,
  transcribed: string,
  paraphrased: string
}

const TechnicalInterviewerScreen: React.FC<Props> = ({ route, navigation }: Props) => {
  async function toggleRecording() {
    if (!microphoneDisabled) {
      await startRecording(`t${currentQuestion}`);
    } else {

      await stopRecording(accessToken, setTranscriberOutput);

      if (currentQuestion + 1 != questions.length) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        navigation.navigate('InterviewerResults', { questions });
      };
    };
    setMicrophoneDisabled(!microphoneDisabled);
  };

  const { keywords } = route.params;
  const theme = useTheme();
  const [microphoneDisabled, setMicrophoneDisabled] = React.useState<boolean>(false);
  const [transcriberOutput, setTranscriberOutput] = React.useState<TranscriberResult>({ file: '', transcribed: '', paraphrased: '' });
  const [questionDetails, setQuestionDetails] = React.useState<Array<QuestionDetails>>([]);
  const [accessToken, setAccessToken] = useAccessToken();

  const [questions, setQuestions] = React.useState<Array<string>>(['']);
  const [currentQuestion, setCurrentQuestion] = React.useState<number>(0);

  useFocusEffect(React.useCallback(() => {
    fetchQuestions('techinterviewer', `keywords=${keywords}`, accessToken, function (err: string, data: QuestionsResult) {
      if (err) { throw err; }
      setQuestions(data.technical_questions);
    });
  }, [keywords]));

  React.useCallback(() => {
    console.log('ssdv')
    if (transcriberOutput.file) {
      let forQuestion = parseInt(transcriberOutput.file[1]);
      questionDetails.push(
        {
          question: questions[forQuestion],
          transcribed: transcriberOutput.transcribed,
          paraphrased: transcriberOutput.paraphrased
        }
      );

      console.log('questionDetails:', questionDetails);

      setTranscriberOutput({ file: '', transcribed: '', paraphrased: '' })
    }
  }, [transcriberOutput]);

  return (
    <Surface style={{ height: '100%', paddingHorizontal: 25, paddingVertical: 50, justifyContent: 'space-between' }}>
      <View>
        <Text variant='titleLarge'>Question {currentQuestion + 1} of {questions.length}</Text>
        <Divider style={{ marginTop: 25, marginBottom: 50 }} />
        <Text variant='titleLarge'>{questions[currentQuestion]}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <IconButton size={40} iconColor={theme.colors.onPrimaryContainer} containerColor={microphoneDisabled ? theme.colors.primaryContainer : theme.dark ? theme.colors.onError : theme.colors.error} icon={'microphone' + (microphoneDisabled ? '' : '-off')} onPress={toggleRecording} />
      </View>
    </Surface>
  );
};

export default TechnicalInterviewerScreen;
