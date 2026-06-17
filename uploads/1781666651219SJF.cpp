#include <bits/stdc++.h>
using namespace std;
struct process{
	
	int id , at , bt , tat , wt , ct ;
	
	};


int main()
{
	
	int n = 0 ; 
	cout<<"Enter Number of Process: ";
	cin>>n;
	
	
	vector<bool>vis(n,0);
	
	
	vector<process>p(5);
	
	for(int i = 0 ; i < n; i++)
	{
			cout<<"Enter Arrival Time & brust Time for Process "<<i+1<<": ";
			
			p[i].id = i+1;
			cin>>p[i].at>>p[i].bt;
			p[i].ct = p[i].bt;
		
		
		
	}
	
	
	
	// ------------- Processing -----------------------------
	
	
	int complete_jobs = 0 ; 
	
	int time = 0 ; // Signifying CPU Time;
	
	double awt = 0.0 , atat = 0.0 ;
	
	while(complete_jobs < n)
	{
		
		// For picking shortest job at current time t
		int picked_job = -1;
		while(picked_job == -1)
		{
		for(int i = 0 ; i < n; i++)
		{
			
			if(!vis[i] && p[i].at <= time && picked_job==-1)
			{
					picked_job = i ;
			}
			
			else if(!vis[i] && p[i].at <= time && p[picked_job].bt > p[i].bt)
			{
					picked_job = i ;
			}
		}
		
		vis[picked_job]=1;
		if(picked_job==-1){time++;}
	}
	
	
	
	// Completing the picked Job
	
	
	time+= p[picked_job].bt;
	p[picked_job].ct = time;
	p[picked_job].tat = time - p[picked_job].at;
	p[picked_job].wt = p[picked_job].tat - p[picked_job].bt;
	complete_jobs++;
	//p[picked_job].bt=INT_MAX;	
	atat+=	p[picked_job].tat;
	awt+=	p[picked_job].wt;
		
		
		}
		
		
		// Formatting the output
		
	cout<<"-------------------------------------------------------------------------------------------------------------"<<endl;
	cout<<"________________________________ Shortest Job First____________________________________________________________"<<endl;
	cout<<"-------------------------------------------------------------------------------------------------------------"<<endl;	
		
		cout<<"ProcessID \tArrival Time\t Brust Time\t TrunAround Time\t Waiting Time\n";
		for(int i = 0 ; i < n; i++)
		{
			
				cout<<"\t"<<i+1<<"\t\t"<<p[i].at<<"\t\t"<<p[i].bt<<"\t\t"<<p[i].tat<<"\t\t"<<p[i].wt<<endl;
			
		}
		
	cout<<"-------------------------------------------------------------------------------------------------------------"<<endl;
	cout<<"-------------------------------------------------------------------------------------------------------------"<<endl;
	
	
	cout<<"Average Waiting Time: "<<(awt/(1.0*n));
	cout<<"Average Turnaround Time: "<<(atat/(1.0*n));	
		
}
