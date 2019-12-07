import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import {
  LinearProgress,
  Step,
  StepContent,
  StepLabel,
  Stepper,
} from '@material-ui/core';

import SteamSignIn from './SteamSignIn';
import BefriendBot from './BefriendBot';
import SelectedHeroes from './SelectedHeroes';


const QUERY = gql`
  { 
    viewer {
      __typename
      id
      personaname
      avatarmedium
      botInFriends
      selectedHeroes { id }
    }
  }
`;

export default function Wizard() {
  const { loading, error, data } = useQuery(QUERY);

  const [step, setStep] = React.useState(null);

  if (loading || !!error) return <LinearProgress />;

  if (step === null) {
    const signedIn = !!data.viewer;
    const botInFriends = signedIn && data.viewer.botInFriends;

    if (!signedIn) {
      setStep(0);
    } else if (botInFriends) {
      setStep(2);
    } else {
      setStep(1);
    }
  }

  const toNextStep = () => {
    setStep(step + 1);
  };

  return (
    <>
      <Stepper activeStep={step} orientation="vertical">
        <Step>
          <StepLabel>Sign in with Steam</StepLabel>
          <StepContent>
            <SteamSignIn next="/wizard" />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Add our bot to friends</StepLabel>
          <StepContent>
            <BefriendBot toNextStep={toNextStep} />
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Add a few heroes to practice</StepLabel>
          <StepContent>
            <SelectedHeroes showProfileLink />
          </StepContent>
        </Step>
      </Stepper>
    </>
  );
}
