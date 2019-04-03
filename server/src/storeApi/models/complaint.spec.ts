import { fakeStore, fakeComplaint } from './../../../test/fakes';
import Chance from 'chance';
import {fakeUser } from '../../../test/fakes';

describe('Store model',() => {

  const chance = new Chance();
  it('get changeable store details', () => {
    const complaint1 = fakeComplaint({});

    var Complaint_name = complaint1.body;
    expect(complaint1.body).toEqual(Complaint_name);
      
    });

  it('change complaint details', () => {
      const complaint1 = fakeComplaint({});
  
      complaint1.body = "big problem was here";
      expect(complaint1.body).toEqual("big problem was here");
        
      });

  });